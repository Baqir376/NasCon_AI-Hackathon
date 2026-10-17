'use client';

import React, { useState } from 'react';
import { ExternalLink, ThumbsUp, SkipForward, Bookmark, CheckCircle2 } from 'lucide-react';
import { CanonicalStory } from '@/lib/synthesis/schema';

interface StoryCardProps {
  story: CanonicalStory;
  onFeedback: (articleId: string, eventType: 'upvote' | 'skip' | 'save', topic?: string) => Promise<void>;
}

export function StoryCard({ story, onFeedback }: StoryCardProps) {
  const [feedbackState, setFeedbackState] = useState<'idle' | 'upvoted' | 'skipped' | 'saved'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <div className="story-card story-card-skipped">
        <p><em>Story skipped. Editorial model updated for {story.sectionName}.</em></p>
      </div>
    );
  }

  return (
    <article className="story-card">
      <div className="story-meta">
        <span className="story-source">
          <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer">
            {story.sourceName}
            <ExternalLink size={10} style={{ marginLeft: 3, display: 'inline' }} />
          </a>
        </span>
        <span className="story-date">
          {new Date(story.publishedAt).toLocaleDateString()}
        </span>
      </div>

      <h3 className="story-headline">
        <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer">
          {story.headline}
        </a>
      </h3>

      <p className="story-narrative">{story.narrativeText}</p>

      <ul className="story-bullets">
        {story.summaryBullets.map((bullet, idx) => (
          <li key={idx} className="story-bullet-item">
            <CheckCircle2 size={13} className="bullet-check-small" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      {story.sourceQuote && (
        <p className="story-quote-snippet">
          <span className="quote-tag">Source Quote:</span> “{story.sourceQuote}”
        </p>
      )}

      <div className="story-why-mini">
        <strong>Relevance:</strong> {story.whyItMatters}
      </div>

      <div className="story-card-actions">
        <button
          onClick={() => handleAction('upvote')}
          disabled={isSubmitting || feedbackState === 'upvoted'}
          className={`mini-action-btn ${feedbackState === 'upvoted' ? 'active' : ''}`}
          title="More like this"
        >
          <ThumbsUp size={12} />
          <span>{feedbackState === 'upvoted' ? 'Liked' : 'Like'}</span>
        </button>

        <button
          onClick={() => handleAction('save')}
          disabled={isSubmitting || feedbackState === 'saved'}
          className={`mini-action-btn ${feedbackState === 'saved' ? 'active' : ''}`}
          title="Save story"
        >
          <Bookmark size={12} />
          <span>{feedbackState === 'saved' ? 'Saved' : 'Save'}</span>
        </button>

        <button
          onClick={() => handleAction('skip')}
          disabled={isSubmitting}
          className="mini-action-btn mini-action-skip"
          title="Skip topic"
        >
          <SkipForward size={12} />
          <span>Skip</span>
        </button>
      </div>
    </article>
  );
}
