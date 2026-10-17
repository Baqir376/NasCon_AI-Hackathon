/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  ThumbsUp,
  SkipForward,
  Bookmark,
  CheckCircle2,
  Clock,
  Quote,
  BookOpen,
} from 'lucide-react';
import { CanonicalStory } from '@/lib/synthesis/schema';
import { analyzeStoryNLP } from '@/lib/nlp';
import { getEditorialImageForStory } from '@/lib/editorial-images';
import { playAudioHaptic } from '@/lib/audio-haptics';

interface StoryCardProps {
  story: CanonicalStory;
  onFeedback: (articleId: string, eventType: 'upvote' | 'skip' | 'save', topic?: string) => Promise<void>;
  onOpenReader?: (story: CanonicalStory) => void;
}

export function StoryCard({ story, onFeedback, onOpenReader }: StoryCardProps) {
  const [feedbackState, setFeedbackState] = useState<'idle' | 'upvoted' | 'skipped' | 'saved'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nlp = useMemo(() => {
    return analyzeStoryNLP(story.narrativeText, story.summaryBullets);
  }, [story.narrativeText, story.summaryBullets]);

  const editorialImage = useMemo(() => {
    return getEditorialImageForStory(
      story.headline,
      story.sectionName,
      story.leadImageUrl,
      story.positionOrder || 0
    );
  }, [story.headline, story.sectionName, story.leadImageUrl, story.positionOrder]);

  const handleAction = async (type: 'upvote' | 'skip' | 'save') => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    playAudioHaptic('action');
    try {
      await onFeedback(story.articleId, type, story.sectionName);
      setFeedbackState(type === 'upvote' ? 'upvoted' : type === 'skip' ? 'skipped' : 'saved');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = () => {
    if (onOpenReader) {
      playAudioHaptic('click');
      onOpenReader(story);
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
    <article className="story-card" data-cursor="Read Dispatch">
      {/* Top Meta & Origin */}
      <div className="story-meta">
        <span className="story-source">
          <a
            href={story.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Inspect primary source wire"
            data-cursor="Primary Wire"
            onClick={(e) => e.stopPropagation()}
          >
            {story.sourceName}
            <ExternalLink size={10} style={{ marginLeft: 3, display: 'inline' }} />
          </a>
        </span>
        <div className="flex items-center gap-2">
          <span className="story-telemetry-pill">
            <Clock size={10} />
            <span>{nlp.readingTimeMinutes}m read</span>
          </span>
          <span className="story-date">
            {new Date(story.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Editorial Photograph Frame */}
      {editorialImage && (
        <div
          className="story-card-image-box"
          onClick={handleCardClick}
          title="Click to open full newspaper article reading room"
        >
          <img
            src={editorialImage.url}
            alt={story.headline}
            className="story-card-photo"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1600&q=80';
            }}
          />
          <div className="story-card-caption-bar">
            <span>{editorialImage.caption}</span>
          </div>
        </div>
      )}

      {/* Headline (Triggers Reading Room on Click) */}
      <h3 className="story-headline" onClick={handleCardClick}>
        <span className="cursor-pointer hover:underline">{story.headline}</span>
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
        {onOpenReader && (
          <button
            onClick={handleCardClick}
            className="mini-action-btn read-dispatch-btn"
            title="Open in Broadsheet Reading Room"
            data-cursor="Read"
          >
            <BookOpen size={11} />
            <span>Read Article</span>
          </button>
        )}

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
          <span>Skip</span>
        </button>

        <a
          href={story.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mini-action-btn external-wire-btn"
          title="Visit original publisher reporting externally"
          data-cursor="External Wire"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={11} />
          <span>Wire ↗</span>
        </a>
      </div>
    </article>
  );
}
