'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const AVAILABLE_TOPICS = [
  'Artificial Intelligence',
  'Open Source Software',
  'Biotechnology & Genomics',
  'Healthcare & Medicine',
  'Clean Energy & Climate',
  'Global Economy & Markets',
  'Semiconductors & Chips',
  'Scientific Breakthroughs',
  'Cybersecurity',
  'Space & Astrophysics',
  'Geopolitics',
];

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopics: string[];
  currentReadingDepth: 'quick_scan' | 'balanced' | 'deep_dive';
  currentSerendipity: boolean;
  onSavePreferences: (topics: string[], depth: 'quick_scan' | 'balanced' | 'deep_dive', serendipity: boolean) => Promise<void>;
  isSaving: boolean;
}

export function PreferencesModal({
  isOpen,
  onClose,
  currentTopics,
  currentReadingDepth,
  currentSerendipity,
  onSavePreferences,
  isSaving,
}: PreferencesModalProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(currentTopics);
  const [readingDepth, setReadingDepth] = useState<'quick_scan' | 'balanced' | 'deep_dive'>(currentReadingDepth);
  const [serendipity, setSerendipity] = useState<boolean>(currentSerendipity);

  React.useEffect(() => {
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

  if (!isOpen) return null;

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((t) => t !== topic));
      }
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSave = async () => {
    await onSavePreferences(selectedTopics, readingDepth, serendipity);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      data-lenis-prevent="true"
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        className="modal-container"
        data-lenis-prevent="true"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Editorial Preferences & Topics</h3>
            <p className="modal-subtitle">
              Customize which subjects shape your morning edition and configure synthesis depth.
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <div
          className="preferences-body"
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Topics Selection */}
          <div className="pref-section">
            <h4 className="pref-label">Curated Beats & Interests (Select at least 1):</h4>
            <div className="topics-picker-grid">
              {AVAILABLE_TOPICS.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`topic-picker-btn ${isSelected ? 'selected' : ''}`}
                  >
                    {isSelected && <Check size={14} style={{ marginRight: 4 }} />}
                    <span>{topic}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reading Depth */}
          <div className="pref-section">
            <h4 className="pref-label">Reading Depth:</h4>
            <div className="depth-options-grid">
              <div
                onClick={() => setReadingDepth('quick_scan')}
                className={`depth-card ${readingDepth === 'quick_scan' ? 'active' : ''}`}
              >
                <h5>Quick Scan (3 mins)</h5>
                <p>2 crisp bullet points per story for high-velocity morning skimmers.</p>
              </div>

              <div
                onClick={() => setReadingDepth('balanced')}
                className={`depth-card ${readingDepth === 'balanced' ? 'active' : ''}`}
              >
                <h5>Balanced (8 mins)</h5>
                <p>3 verified takeaways with narrative context and primary source quotes.</p>
              </div>

              <div
                onClick={() => setReadingDepth('deep_dive')}
                className={`depth-card ${readingDepth === 'deep_dive' ? 'active' : ''}`}
              >
                <h5>Deep Dive (15 mins)</h5>
                <p>4 comprehensive evidence bullets with full technical and policy impact.</p>
              </div>
            </div>
          </div>

          {/* Serendipity Discovery */}
          <div className="pref-section">
            <label className="serendipity-toggle-label">
              <input
                type="checkbox"
                checked={serendipity}
                onChange={(e) => setSerendipity(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <div>
                <strong>Include “The Horizon” Discovery Feature</strong>
                <p>Reserves one spot in your paper for a high-impact breakthrough outside your selected topics.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || selectedTopics.length === 0}
            className="btn-primary"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
