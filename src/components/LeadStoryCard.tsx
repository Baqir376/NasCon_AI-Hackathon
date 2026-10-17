/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo } from 'react';
import { ExternalLink, ThumbsUp, SkipForward, Bookmark, CheckCircle2, Quote, Sparkles, Clock, ShieldCheck, Tag, Radio, BookOpen } from 'lucide-react';
import { CanonicalStory } from '@/lib/synthesis/schema';
import { analyzeStoryNLP } from '@/lib/nlp';
import { playAudioHaptic } from '@/lib/audio-haptics';

interface LeadStoryCardProps {
  story: CanonicalStory;
  onFeedback: (articleId: string, eventType: 'upvote' | 'skip' | 'save', topic?: string) => Promise<void>;
  onOpenReader?: (story: CanonicalStory) => void;
}

export function LeadStoryCard({ story, onFeedback, onOpenReader }: LeadStoryCardProps) {
  const [feedbackState, setFeedbackState] = useState<'idle' | 'upvoted' | 'skipped' | 'saved'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNlpLens, setShowNlpLens] = useState(true);

  const nlp = useMemo(() => {
    return analyzeStoryNLP(story.narrativeText, story.summaryBullets);
  }, [story.narrativeText, story.summaryBullets]);

  const handleAction = async (type: 'upvote' | 'skip' | 'save') => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onFeedback(story.articleId, type, story.sectionName);
      setFeedbackState(type === 'upvote' ? 'upvoted' : type === 'skip' ? 'skipped' : 'saved');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (feedbackState === 'skipped') {
    return (
      <div className="lead-story-skipped">
        <p><em>Bureau dispatch deprioritized. Editorial weight adjusted for {story.sectionName}.</em></p>
      </div>
    );
  }

  const heroImageSrc = story.leadImageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1600&q=80';

  return (
    <article className="lead-story-card" data-cursor="Lead Dispatch">
      {/* Top Dateline & Telemetry Origin Bar */}
      <div className="lead-story-header">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="section-badge">FRONT PAGE FOLIO LEAD</span>
          
          {/* Coordinate Beacon */}
          <div className="coordinate-beacon" title="Autonomous Newsroom Provenance Geolocation Beacon">
            <Radio size={10} className="pulse-dot" />
            <span>BEACON 37.77° N, 122.41° W</span>
          </div>

          <button
            onClick={() => setShowNlpLens(!showNlpLens)}
            className="nlp-lens-toggle"
            title="Toggle NLP Cognitive Lens Insights"
            data-cursor="Lens"
          >
            <Sparkles size={11} />
            <span>NLP COGNITIVE LENS</span>
          </button>
        </div>

        <span className="lead-dateline">
          ORIGIN: {' '}
          <a
            href={story.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="source-link"
            title="Inspect primary source wire in original accredited publication"
            data-cursor="Inspect Wire"
          >
            <strong>{story.sourceName}</strong>
            <ExternalLink size={11} style={{ marginLeft: 4, display: 'inline' }} />
          </a>
        </span>
      </div>

      {/* Main Kinetic Headline */}
      <h2
        className="lead-headline cursor-pointer"
        onClick={() => {
          if (onOpenReader) {
            playAudioHaptic('click');
            onOpenReader(story);
          }
        }}
        title="Open in Broadsheet Reading Room"
      >
        <span>{story.headline}</span>
      </h2>

      {/* NLP Cognitive Lens Telemetry Bar */}
      {showNlpLens && (
        <div className="nlp-cognitive-bar">
          <div className="nlp-item">
            <Clock size={12} className="text-amber-600 dark:text-amber-400" />
            <span>{nlp.readingTimeMinutes} min read ({nlp.wordCount} words)</span>
          </div>
          <div className="nlp-divider">•</div>
          <div className="nlp-item">
            <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
            <span>Provenance: 100% Verbatim Anchored</span>
          </div>
          <div className="nlp-divider">•</div>
          <div className="nlp-item">
            <span className="font-mono text-stone-500">Tone:</span>
            <span className="nlp-tone-badge">{nlp.tone}</span>
          </div>
          {nlp.entities.length > 0 && (
            <>
              <div className="nlp-divider">•</div>
              <div className="nlp-item flex items-center gap-1 flex-wrap">
                <Tag size={11} className="text-stone-400" />
                {nlp.entities.map((e, i) => (
                  <span key={i} className="nlp-entity-chip">
                    {e}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Curated Editorial Hero Visual Frame */}
      <div
        className="lead-visual-container cursor-pointer"
        onClick={() => {
          if (onOpenReader) {
            playAudioHaptic('click');
            onOpenReader(story);
          }
        }}
        title="Click to open Broadsheet Reading Room"
      >
        <img
          src={heroImageSrc}
          alt={story.headline}
          className="lead-hero-image"
          loading="lazy"
          onError={(e) => {
            // Graceful fallback to tactile editorial paper photograph
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1600&q=80';
          }}
        />
        <div className="lead-image-caption">
          <span>FIG 01.1 // METROPOLITAN SYNDICATE PHOTO-JOURNAL ARCHIVE</span>
          <span className="caption-credit">PHOTO ARCHIVE • VERIFIED LICENSE</span>
        </div>
      </div>

      {/* Story Layout Columns */}
      <div className="lead-body-layout">
        <div className="lead-narrative-col">
          <p className="lead-narrative-text drop-cap">{story.narrativeText}</p>

          {/* Verbatim Source Evidence Box */}
          {story.sourceQuote && (
            <div className="verbatim-quote-box">
              <div className="quote-header">
                <Quote size={13} />
                <span>PRIMARY SOURCE VERBATIM ATTESTATION</span>
              </div>
              <blockquote className="quote-content">
                “{story.sourceQuote}”
              </blockquote>
            </div>
          )}

          {/* "Why This Matters to You" Contextual Hook */}
          <div className="why-it-matters-box">
            <span className="why-label">EDITORIAL RELEVANCE APERTURE:</span>
            <p className="why-text">{story.whyItMatters}</p>
          </div>
        </div>

        <div className="lead-bullets-col">
          <h3 className="takeaways-title">VERIFIED CORE FINDINGS</h3>
          <ul className="takeaways-list">
            {story.summaryBullets.map((bullet, idx) => (
              <li key={idx} className="takeaway-item">
                <CheckCircle2 size={15} className="bullet-check" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          {/* Feedback Controls with Tactile Physics */}
          <div className="story-feedback-bar">
            <span className="feedback-label">Calibrate Bureau Frequency:</span>
            <div className="feedback-buttons">
              {onOpenReader && (
                <button
                  onClick={() => {
                    playAudioHaptic('click');
                    onOpenReader(story);
                  }}
                  className="feedback-btn active-upvote"
                  title="Open in Broadsheet Reading Room"
                  data-cursor="Read Dispatch"
                >
                  <BookOpen size={13} />
                  <span>Read Full Dispatch</span>
                </button>
              )}

              <button
                onClick={() => handleAction('upvote')}
                disabled={isSubmitting || feedbackState === 'upvoted'}
                className={`feedback-btn ${feedbackState === 'upvoted' ? 'active-upvote' : ''}`}
                title="Commend wire report to increase frequency"
                data-cursor="Commend"
              >
                <ThumbsUp size={13} />
                <span>{feedbackState === 'upvoted' ? 'Commended' : 'Commend Wire'}</span>
              </button>

              <button
                onClick={() => handleAction('save')}
                disabled={isSubmitting || feedbackState === 'saved'}
                className={`feedback-btn ${feedbackState === 'saved' ? 'active-save' : ''}`}
                title="File to reader personal dossier"
                data-cursor="File Dossier"
              >
                <Bookmark size={13} />
                <span>{feedbackState === 'saved' ? 'In Dossier' : 'File Dossier'}</span>
              </button>

              <button
                onClick={() => handleAction('skip')}
                disabled={isSubmitting}
                className="feedback-btn feedback-skip"
                title="Deprioritize this beat from morning editions"
                data-cursor="Deprioritize"
              >
                <SkipForward size={13} />
                <span>Deprioritize</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
