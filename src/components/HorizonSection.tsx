/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { Compass, ExternalLink, Sparkles, ThumbsUp, Bookmark } from 'lucide-react';
import { CanonicalStory } from '@/lib/synthesis/schema';

interface HorizonSectionProps {
  story: CanonicalStory;
  onFeedback: (articleId: string, eventType: 'upvote' | 'skip' | 'save', topic?: string) => Promise<void>;
}

export function HorizonSection({ story, onFeedback }: HorizonSectionProps) {
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
          <div className="horizon-visual-col hidden md:block">
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
                >
                  <strong>{story.sourceName}</strong>
                  <ExternalLink size={10} style={{ marginLeft: 3, display: 'inline' }} />
                </a>
              </span>
              <span className="horizon-date">
                {new Date(story.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h3 className="horizon-headline">
              <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer">
                {story.headline}
              </a>
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
