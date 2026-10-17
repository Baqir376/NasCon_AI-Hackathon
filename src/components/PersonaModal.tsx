'use client';

import React from 'react';
import { X, Check, Sparkles } from 'lucide-react';

interface PersonaInfo {
  key: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  topics: string[];
}

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPersonaKey?: string;
  personas: PersonaInfo[];
  onSelectPersona: (key: string) => Promise<void>;
  isSwitching: boolean;
}

export function PersonaModal({
  isOpen,
  onClose,
  currentPersonaKey,
  personas,
  onSelectPersona,
  isSwitching,
}: PersonaModalProps) {
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
            <h3 className="modal-title">Select Reader Persona</h3>
            <p className="modal-subtitle">
              Instant judge testing: switch between isolated reader profiles with distinct interests and learned weights.
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <div
          className="persona-grid"
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
        >
          {personas.map((persona) => {
            const isSelected = currentPersonaKey === persona.key;

            return (
              <div
                key={persona.key}
                onClick={() => !isSwitching && onSelectPersona(persona.key)}
                className={`persona-card ${isSelected ? 'persona-card-active' : ''}`}
              >
                <div className="persona-card-top">
                  <span className="persona-avatar">{persona.avatar}</span>
                  <div>
                    <h4 className="persona-name">{persona.name}</h4>
                    <p className="persona-title">{persona.title}</p>
                  </div>
                  {isSelected && (
                    <span className="persona-active-badge">
                      <Check size={14} /> Active
                    </span>
                  )}
                </div>

                <p className="persona-bio">{persona.bio}</p>

                <div className="persona-topics">
                  {persona.topics.map((t, idx) => (
                    <span key={idx} className="topic-chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-footer">
          <p className="modal-hint">
            <Sparkles size={14} style={{ display: 'inline', marginRight: 4 }} />
            Each persona operates in strict data isolation with its own historical editions and feedback weights.
          </p>
        </div>
      </div>
    </div>
  );
}
