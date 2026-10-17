'use client';

import React, { useState, useMemo } from 'react';
import { ExternalLink, ThumbsUp, SkipForward, Bookmark, CheckCircle2, Clock, ShieldCheck, Quote } from 'lucide-react';
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
        <p><em>Dispatch deprioritized. Editorial balance adjusted for {story.sectionName}.</em></p>
      </div>
    );
  }

  return (
    <article className="story-card" data-cursor="Inspect Story">
      {/* Top Meta & Origin */}
      <div className="story-meta">
        <span className="story-source">
          <a
            href={story.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Inspect primary source wire"
            data-cursor="Primary Wire"
          >
            {story.sourceName}
            <ExternalLink size={10} style={{ marginLeft: 3, display: 'inline' }} />
          </a>
        </span>
        <div className="flex items-center gap-2">
          <span className="story-telemetry-pill">
            <Clock size={10} />
            <span>{nlp.readingTimeMinutes}m</span>
          </span>
          <span className="story-date">
            {new Date(story.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
          <Quote size={11} className="inline mr-1 text-amber-700/60 dark:text-amber-400/60" />
          <span className="quote-tag">Primary Source Evidence:</span> “{story.sourceQuote}”
        </p>
      )}

      {/* Relevance Hook */}
      <div className="story-why-mini">
        <span className="relevance-lead">Relevance Aperture:</span> {story.whyItMatters}
      </div>

      {/* Entity Chips */}
      {nlp.entities.length > 0 && (
        <div className="story-entity-row">
          {nlp.entities.slice(0, 3).map((ent, i) => (
            <span key={i} className="story-entity-tag">
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
          title="Commend this bureau dispatch"
          data-cursor="Commend"
        >
          <ThumbsUp size={11} />
          <span>{feedbackState === 'upvoted' ? 'Commended' : 'Commend'}</span>
        </button>

        <button
          onClick={() => handleAction('save')}
          disabled={isSubmitting || feedbackState === 'saved'}
          className={`mini-action-btn ${feedbackState === 'saved' ? 'active' : ''}`}
          title="File to reader personal dossier"
          data-cursor="File Dossier"
        >
          <Bookmark size={11} />
          <span>{feedbackState === 'saved' ? 'In Dossier' : 'Dossier'}</span>
        </button>

        <button
          onClick={() => handleAction('skip')}
          disabled={isSubmitting}
          className="mini-action-btn mini-action-skip"
          title="Deprioritize this subject beat"
          data-cursor="Deprioritize"
        >
          <SkipForward size={11} />
          <span>Deprioritize</span>
        </button>
      </div>
    </article>
  );
}
