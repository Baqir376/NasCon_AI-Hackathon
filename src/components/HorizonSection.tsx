/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { Compass, ExternalLink, Sparkles, ThumbsUp, Bookmark, BookOpen } from 'lucide-react';
import { CanonicalStory } from '@/lib/synthesis/schema';
import { playAudioHaptic } from '@/lib/audio-haptics';

interface HorizonSectionProps {
  story: CanonicalStory;
  onFeedback: (articleId: string, eventType: 'upvote' | 'skip' | 'save', topic?: string) => Promise<void>;
  onOpenReader?: (story: CanonicalStory) => void;
}

export function HorizonSection({ story, onFeedback, onOpenReader }: HorizonSectionProps) {
  const [feedbackState, setFeedbackState] = useState<'idle' | 'upvoted' | 'saved'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (type: 'upvote' | 'save') => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onFeedback(story.articleId, type, story.sectionName);
      setFeedbackState(type === 'upvote' ? 'upvoted' : 'saved');
    } finally {
      setIsSubmitting(false);
    }
  };

  const horizonVisualUrl = story.leadImageUrl || 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80';

  return (
    <section className="horizon-container" data-cursor="The Horizon">
      <div className="horizon-badge-row">
        <div className="horizon-label">
          <Compass size={15} className="compass-spin" />
          <span>THE HORIZON • OUT-OF-DISTRIBUTION DISCOVERY</span>
        </div>
        <div className="horizon-motto">
          <Sparkles size={13} />
          <span>Curated strictly outside your habitual reading profile to prevent algorithmic echo chambers</span>
        </div>
      </div>

      <div className="horizon-card">
        <div className="horizon-grid">
          {/* Celestial Astronomy Visual Column */}
          <div
            className="horizon-visual-col hidden md:block cursor-pointer"
            onClick={() => {
              if (onOpenReader) {
                playAudioHaptic('click');
                onOpenReader(story);
              }
            }}
            title="Open in Broadsheet Reading Room"
          >
            <img
              src={horizonVisualUrl}
              alt="The Horizon Serendipity Discovery"
              className="horizon-image"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="horizon-image-tag">
              <span>EXPLORATION WIRE // BEAT: {story.sectionName.toUpperCase()}</span>
            </div>
          </div>

          {/* Narrative Content Column */}
          <div className="horizon-content-col">
            <div className="horizon-meta">
              <span className="horizon-source">
                DISPATCH WIRE:{' '}
                <a
                  href={story.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="Inspect Wire"
                  onClick={(e) => e.stopPropagation()}
                >
                  <strong>{story.sourceName}</strong>
                  <ExternalLink size={10} style={{ marginLeft: 3, display: 'inline' }} />
                </a>
              </span>
              <span className="horizon-date">
                {new Date(story.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h3
              className="horizon-headline cursor-pointer"
              onClick={() => {
                if (onOpenReader) {
                  playAudioHaptic('click');
                  onOpenReader(story);
                }
              }}
              title="Open in Broadsheet Reading Room"
            >
              <span>{story.headline}</span>
            </h3>

            <p className="horizon-narrative">{story.narrativeText}</p>

            <div className="horizon-bullets">
              {story.summaryBullets.map((b, idx) => (
                <div key={idx} className="horizon-bullet-item">
                  <span className="horizon-bullet-dot">✦</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>

            {story.sourceQuote && (
              <blockquote className="horizon-quote">
                “{story.sourceQuote}”
              </blockquote>
            )}

            <div className="horizon-why">
              <span className="why-horizon-lead">Curatorial Rationale:</span> {story.whyItMatters}
            </div>

            <div className="horizon-actions-row">
              {onOpenReader && (
                <button
                  onClick={() => {
                    playAudioHaptic('click');
                    onOpenReader(story);
                  }}
                  className="mini-action-btn active"
                  title="Open in Broadsheet Reading Room"
                  data-cursor="Read"
                >
                  <BookOpen size={11} />
                  <span>Read Discovery</span>
                </button>
              )}

              <button
                onClick={() => handleAction('upvote')}
                disabled={isSubmitting || feedbackState === 'upvoted'}
                className={`mini-action-btn ${feedbackState === 'upvoted' ? 'active' : ''}`}
                title="Commend this serendipity discovery"
                data-cursor="Commend"
              >
                <ThumbsUp size={11} />
                <span>{feedbackState === 'upvoted' ? 'Commended' : 'Commend Discovery'}</span>
              </button>

              <button
                onClick={() => handleAction('save')}
                disabled={isSubmitting || feedbackState === 'saved'}
                className={`mini-action-btn ${feedbackState === 'saved' ? 'active' : ''}`}
                title="Save to dossier"
                data-cursor="File Dossier"
              >
                <Bookmark size={11} />
                <span>{feedbackState === 'saved' ? 'Saved to Dossier' : 'Save Discovery'}</span>
              </button>

              <a
                href={story.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mini-action-btn"
                title="Visit primary publisher wire"
                data-cursor="Wire"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={11} />
                <span>Wire ↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
