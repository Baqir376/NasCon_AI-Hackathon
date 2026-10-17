'use client';

import React from 'react';
import { Compass, ExternalLink, Sparkles } from 'lucide-react';
import { CanonicalStory } from '@/lib/synthesis/schema';

interface HorizonSectionProps {
  story: CanonicalStory;
  onFeedback: (articleId: string, eventType: 'upvote' | 'skip' | 'save', topic?: string) => Promise<void>;
}

export function HorizonSection({ story, onFeedback }: HorizonSectionProps) {
  return (
    <section className="horizon-container">
      <div className="horizon-badge-row">
        <div className="horizon-label">
          <Compass size={16} />
          <span>THE HORIZON • SERENDIPITY DISCOVERY</span>
        </div>
        <div className="horizon-motto">
          <Sparkles size={14} />
          <span>Curated strictly outside your filter bubble to expand your perspective</span>
        </div>
      </div>

      <div className="horizon-card">
        <div className="horizon-meta">
          <span className="horizon-source">
            Reported by{' '}
            <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer">
              <strong>{story.sourceName}</strong>
              <ExternalLink size={11} style={{ marginLeft: 3, display: 'inline' }} />
            </a>
          </span>
          <span className="horizon-date">
            {new Date(story.publishedAt).toLocaleDateString()}
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
          <strong>Why we included this:</strong> {story.whyItMatters}
        </div>
      </div>
    </section>
  );
}
