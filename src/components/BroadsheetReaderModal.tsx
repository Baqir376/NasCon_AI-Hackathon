/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  ExternalLink,
  ThumbsUp,
  Bookmark,
  CheckCircle2,
  Quote,
  Clock,
  ShieldCheck,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minus,
  Plus,
  Share2,
} from 'lucide-react';
import { CanonicalStory } from '@/lib/synthesis/schema';
import { getEditorialImageForStory } from '@/lib/editorial-images';
import { analyzeStoryNLP } from '@/lib/nlp';
import { playAudioHaptic } from '@/lib/audio-haptics';

interface BroadsheetReaderModalProps {
  story: CanonicalStory | null;
  isOpen: boolean;
  onClose: () => void;
  onNextStory?: () => void;
  onPrevStory?: () => void;
  onFeedback: (articleId: string, eventType: 'upvote' | 'skip' | 'save', topic?: string) => Promise<void>;
}

export function BroadsheetReaderModal({
  story,
  isOpen,
  onClose,
  onNextStory,
  onPrevStory,
  onFeedback,
}: BroadsheetReaderModalProps) {
  const [fontSize, setFontSize] = useState<number>(18);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'upvoted' | 'saved'>('idle');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  // Lock body scroll and pause Lenis smooth scroller while Reading Room is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      if (typeof window !== 'undefined') {
        window.__lenis?.stop();
      }
    } else {
      document.body.classList.remove('modal-open');
      if (typeof window !== 'undefined') {
        window.__lenis?.start();
      }
    }

    return () => {
      document.body.classList.remove('modal-open');
      if (typeof window !== 'undefined') {
        window.__lenis?.start();
      }
    };
  }, [isOpen]);

  // Close on Escape, navigate on Arrow keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && onNextStory) {
        onNextStory();
      } else if (e.key === 'ArrowLeft' && onPrevStory) {
        onPrevStory();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNextStory, onPrevStory]);

  // Reset states when story changes
  useEffect(() => {
    setFeedbackState('idle');
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [story?.id]);

  const nlp = useMemo(() => {
    if (!story) return null;
    return analyzeStoryNLP(story.narrativeText, story.summaryBullets);
  }, [story]);

  const editorialImage = useMemo(() => {
    if (!story) return null;
    return getEditorialImageForStory(
      story.headline,
      story.sectionName,
      story.leadImageUrl,
      story.positionOrder || 0
    );
  }, [story]);

  if (!isOpen || !story) return null;

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      playAudioHaptic('click');
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${story.headline}. Published by ${story.sourceName}. ${story.narrativeText}. Key findings: ${story.summaryBullets.join('. ')}. Why this matters: ${story.whyItMatters}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.pitch = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      playAudioHaptic('action');
    }
  };

  const handleFeedbackAction = async (type: 'upvote' | 'save') => {
    playAudioHaptic('action');
    await onFeedback(story.articleId, type === 'upvote' ? 'upvote' : 'save', story.sectionName);
    setFeedbackState(type === 'upvote' ? 'upvoted' : 'saved');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(story.sourceUrl);
      setCopiedLink(true);
      playAudioHaptic('click');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePaperWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (scrollContentRef.current && e.target !== scrollContentRef.current) {
      scrollContentRef.current.scrollTop += e.deltaY;
    }
  };

  return (
    <div
      className="broadsheet-reader-overlay"
      data-lenis-prevent="true"
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label="Broadsheet Article Reading Room"
    >
      <div
        className="broadsheet-reader-paper"
        data-lenis-prevent="true"
        onClick={(e) => e.stopPropagation()}
        onWheel={handlePaperWheel}
        style={{ '--reader-font-size': `${fontSize}px` } as React.CSSProperties}
      >
        {/* Top Reading Room Header Rail */}
        <header className="reader-top-bar">
          <div className="reader-meta-group">
            <span className="reader-kicker">THE BROADSHEET READING ROOM</span>
            <span className="reader-divider">•</span>
            <span className="reader-section-tag">{story.sectionName.toUpperCase()}</span>
            {nlp && (
              <>
                <span className="reader-divider">•</span>
                <span className="reader-time-tag">
                  <Clock size={11} className="inline mr-1" />
                  {nlp.readingTimeMinutes} MIN READ ({nlp.wordCount} WORDS)
                </span>
              </>
            )}
          </div>

          <div className="reader-controls-group">
            {/* Audio Reader */}
            <button
              onClick={handleToggleSpeech}
              className={`reader-tool-btn ${isSpeaking ? 'active-speaking' : ''}`}
              title={isSpeaking ? 'Pause reading voice' : 'Listen to article narrated'}
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isSpeaking ? 'PAUSE VOICE' : 'LISTEN'}</span>
            </button>

            {/* Font Size Adjusters */}
            <div className="reader-font-stepper">
              <button
                onClick={() => setFontSize((s) => Math.max(14, s - 1))}
                className="font-step-btn"
                title="Decrease font size"
              >
                <Minus size={12} />
              </button>
              <span className="font-size-label">{fontSize}px</span>
              <button
                onClick={() => setFontSize((s) => Math.min(26, s + 1))}
                className="font-step-btn"
                title="Increase font size"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Share / Copy URL */}
            <button
              onClick={handleShare}
              className="reader-tool-btn"
              title="Copy verified primary wire link"
            >
              <Share2 size={13} />
              <span>{copiedLink ? 'COPIED!' : 'SHARE'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="reader-close-btn"
              title="Close Reading Room (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        {/* Paper Container Body */}
        <div
          ref={scrollContentRef}
          className="reader-scroll-content"
          data-lenis-prevent="true"
          tabIndex={0}
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Authentic Newspaper Dateline Bar */}
          <div className="reader-dateline-stripe">
            <div className="reader-origin-badge">
              <ShieldCheck size={12} className="text-emerald-500 mr-1" />
              <span>PRIMARY WIRE ORIGIN:</span>
              <a
                href={story.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="reader-source-link"
                title="Open primary publisher in new tab"
              >
                <strong>{story.sourceName}</strong>
                <ExternalLink size={11} className="inline ml-1" />
              </a>
            </div>

            <div className="reader-date">
              {new Date(story.publishedAt).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>

          {/* Grand Monolithic Article Headline */}
          <h1 className="reader-headline">{story.headline}</h1>

          {/* Curated Authentic Newspaper Lead Photograph */}
          {editorialImage && (
            <figure className="reader-photo-frame">
              <div className="photo-wrapper">
                <img
                  src={editorialImage.url}
                  alt={story.headline}
                  className="reader-photo"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1600&q=80';
                  }}
                />
              </div>
              <figcaption className="reader-photo-caption">
                <span className="caption-text">{editorialImage.caption}</span>
                <span className="caption-credit">{editorialImage.credit}</span>
              </figcaption>
            </figure>
          )}

          {/* Newspaper Editorial Grid: Narrative & Findings */}
          <div className="reader-article-grid">
            {/* Left Column: Full Editorial Narrative */}
            <div className="reader-narrative-col">
              <p className="reader-narrative-text drop-cap-large">
                {story.narrativeText}
              </p>

              {/* Primary Source Verbatim Evidence Quote Box */}
              {story.sourceQuote && (
                <div className="reader-verbatim-box">
                  <div className="verbatim-lead">
                    <Quote size={14} className="text-amber-600 dark:text-amber-400" />
                    <span>PRIMARY SOURCE VERBATIM ATTESTATION</span>
                  </div>
                  <blockquote className="verbatim-quote">
                    “{story.sourceQuote}”
                  </blockquote>
                  <cite className="verbatim-cite">
                    — Accredited to {story.sourceName}
                  </cite>
                </div>
              )}

              {/* Relevance Aperture Callout */}
              <div className="reader-relevance-card">
                <div className="relevance-title">
                  EDITORIAL RELEVANCE APERTURE:
                </div>
                <p className="relevance-text">{story.whyItMatters}</p>
              </div>
            </div>

            {/* Right Column: Verified Takeaway Findings & External Action */}
            <aside className="reader-findings-col">
              <div className="findings-container">
                <h3 className="findings-header">
                  VERIFIED FACTUAL INTELLIGENCE
                </h3>
                <ul className="findings-checklist">
                  {story.summaryBullets.map((bullet, idx) => (
                    <li key={idx} className="finding-item">
                      <CheckCircle2 size={16} className="finding-icon" />
                      <span className="finding-text">{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* Prominent Direct External Publisher Wire Link */}
                <div className="reader-external-cta-box">
                  <span className="cta-kicker">VERIFY AT PRIMARY ORIGIN</span>
                  <p className="cta-desc">
                    Read the complete unedited reporting directly on the original publisher’s website.
                  </p>
                  <a
                    href={story.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="reader-external-btn"
                  >
                    <span>Visit {story.sourceName} Wire</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </aside>
          </div>

          {/* Bottom Actions & Paging Strip */}
          <div className="reader-footer-actions">
            <div className="reader-actions-left">
              <button
                onClick={() => handleFeedbackAction('upvote')}
                disabled={feedbackState === 'upvoted'}
                className={`reader-action-pill ${feedbackState === 'upvoted' ? 'active' : ''}`}
                title="Commend this reporting to increase topic frequency"
              >
                <ThumbsUp size={13} />
                <span>{feedbackState === 'upvoted' ? 'COMMENDED' : 'COMMEND WIRE'}</span>
              </button>

              <button
                onClick={() => handleFeedbackAction('save')}
                disabled={feedbackState === 'saved'}
                className={`reader-action-pill ${feedbackState === 'saved' ? 'active' : ''}`}
                title="Save this dispatch to your personal dossier"
              >
                <Bookmark size={13} />
                <span>{feedbackState === 'saved' ? 'IN DOSSIER' : 'FILE DOSSIER'}</span>
              </button>
            </div>

            <div className="reader-nav-right">
              {onPrevStory && (
                <button
                  onClick={onPrevStory}
                  className="reader-nav-btn"
                  title="Previous Dispatch (←)"
                >
                  <ChevronLeft size={14} />
                  <span>PREV</span>
                </button>
              )}
              {onNextStory && (
                <button
                  onClick={onNextStory}
                  className="reader-nav-btn"
                  title="Next Dispatch (→)"
                >
                  <span>NEXT</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
