'use client';

import React, { useState, useMemo } from 'react';
import { ExternalLink, ThumbsUp, SkipForward, Bookmark, CheckCircle2, Quote, Sparkles, Clock, ShieldCheck, Tag } from 'lucide-react';
import { CanonicalStory } from '@/lib/synthesis/schema';
import { analyzeStoryNLP } from '@/lib/nlp';

interface LeadStoryCardProps {
  story: CanonicalStory;
  onFeedback: (articleId: string, eventType: 'upvote' | 'skip' | 'save', topic?: string) => Promise<void>;
}

export function LeadStoryCard({ story, onFeedback }: LeadStoryCardProps) {
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
        <p><em>You skipped this story. Your editorial profile has decreased weighting for {story.sectionName}.</em></p>
      </div>
    );
  }

  return (
    <article className="lead-story-card">
      {/* Top Dateline & Origin Bar */}
      <div className="lead-story-header">
        <div className="flex items-center gap-2">
          <span className="section-badge">FRONT PAGE LEAD</span>
          <button
            onClick={() => setShowNlpLens(!showNlpLens)}
            className="px-2 py-0.5 text-[10px] font-mono tracking-wider rounded border border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 transition flex items-center gap-1"
            title="Toggle NLP Cognitive Lens Insights"
          >
            <Sparkles size={11} />
            <span>NLP COGNITIVE LENS</span>
          </button>
        </div>

        <span className="lead-dateline">
          Reported by{' '}
          <a
            href={story.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="source-link"
            title="Open original verified article in new tab"
          >
            <strong>{story.sourceName}</strong>
            <ExternalLink size={12} style={{ marginLeft: 4, display: 'inline' }} />
          </a>
        </span>
      </div>

      {/* Main Headline */}
      <h2 className="lead-headline">
        <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer">
          {story.headline}
        </a>
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
            <span>Fact-Check: 100% Verbatim Anchored</span>
          </div>
          <div className="nlp-divider">•</div>
          <div className="nlp-item">
            <span className="font-mono text-stone-500">Tone:</span>
            <span className="nlp-tone-badge">{nlp.tone}</span>
          </div>
          {nlp.entities.length > 0 && (
            <>
              <div className="nlp-divider">•</div>
              <div className="nlp-item flex items-center gap-1">
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

      {/* Story Layout Columns */}
      <div className="lead-body-layout">
        <div className="lead-narrative-col">
          <p className="lead-narrative-text drop-cap">{story.narrativeText}</p>

          {/* Verbatim Source Evidence Box */}
          {story.sourceQuote && (
            <div className="verbatim-quote-box">
              <div className="quote-header">
                <Quote size={14} />
                <span>PRIMARY SOURCE EVIDENCE</span>
              </div>
              <blockquote className="quote-content">
                “{story.sourceQuote}”
              </blockquote>
            </div>
          )}

          {/* "Why This Matters to You" Contextual Hook */}
          <div className="why-it-matters-box">
            <span className="why-label">WHY THIS MATTERS TO YOU:</span>
            <p className="why-text">{story.whyItMatters}</p>
          </div>
        </div>

        <div className="lead-bullets-col">
          <h3 className="takeaways-title">VERIFIED CORE TAKEAWAYS</h3>
          <ul className="takeaways-list">
            {story.summaryBullets.map((bullet, idx) => (
              <li key={idx} className="takeaway-item">
                <CheckCircle2 size={16} className="bullet-check" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          {/* Feedback Controls with Tactile Physics */}
          <div className="story-feedback-bar">
            <span className="feedback-label">Tune Future Editions:</span>
            <div className="feedback-buttons">
              <button
                onClick={() => handleAction('upvote')}
                disabled={isSubmitting || feedbackState === 'upvoted'}
                className={`feedback-btn nav-roll-btn ${feedbackState === 'upvoted' ? 'active-upvote' : ''}`}
                title="More stories like this"
              >
                <ThumbsUp size={14} />
                <span>{feedbackState === 'upvoted' ? 'Upvoted' : 'Relevant'}</span>
              </button>

              <button
                onClick={() => handleAction('save')}
                disabled={isSubmitting || feedbackState === 'saved'}
                className={`feedback-btn nav-roll-btn ${feedbackState === 'saved' ? 'active-save' : ''}`}
                title="Save article to briefcase"
              >
                <Bookmark size={14} />
                <span>{feedbackState === 'saved' ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={() => handleAction('skip')}
                disabled={isSubmitting}
                className="feedback-btn feedback-btn-skip nav-roll-btn"
                title="Less of this topic in future editions"
              >
                <SkipForward size={14} />
                <span>Skip Topic</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
