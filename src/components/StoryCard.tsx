'use client';

import React, { useState, useMemo } from 'react';
import { ExternalLink, ThumbsUp, SkipForward, Bookmark, CheckCircle2, Clock, Tag } from 'lucide-react';
import { CanonicalStory } from '@/lib/synthesis/schema';
import { analyzeStoryNLP } from '@/lib/nlp';

interface StoryCardProps {
  story: CanonicalStory;
  onFeedback: (articleId: string, eventType: 'upvote' | 'skip' | 'save', topic?: string) => Promise<void>;
}

export function StoryCard({ story, onFeedback }: StoryCardProps) {
  const [feedbackState, setFeedbackState] = useState<'idle' | 'upvoted' | 'skipped' | 'saved'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <div className="story-card story-card-skipped">
        <p><em>Story skipped. Editorial model updated for {story.sectionName}.</em></p>
      </div>
    );
  }

  return (
    <article className="story-card">
      {/* Top Meta & Origin */}
      <div className="story-meta">
        <span className="story-source">
          <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer">
            {story.sourceName}
            <ExternalLink size={10} style={{ marginLeft: 3, display: 'inline' }} />
          </a>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
            <Clock size={10} />
            <span>{nlp.readingTimeMinutes}m</span>
          </span>
          <span className="story-date">
            {new Date(story.publishedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Headline */}
      <h3 className="story-headline">
        <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer">
          {story.headline}
        </a>
      </h3>

      {/* Narrative Lead */}
      <p className="story-narrative">{story.narrativeText}</p>

      {/* Summary Bullets */}
      <ul className="story-bullets">
        {story.summaryBullets.map((bullet, idx) => (
          <li key={idx} className="story-bullet-item">
            <CheckCircle2 size={13} className="bullet-check-small" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      {/* Verbatim Quote Snippet */}
      {story.sourceQuote && (
        <p className="story-quote-snippet">
          <span className="quote-tag">Source Quote:</span> “{story.sourceQuote}”
        </p>
      )}

      {/* Relevance Hook */}
      <div className="story-why-mini">
        <strong>Relevance:</strong> {story.whyItMatters}
      </div>

      {/* Entity Chips */}
      {nlp.entities.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 my-2">
          {nlp.entities.slice(0, 3).map((ent, i) => (
            <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              #{ent}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
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
