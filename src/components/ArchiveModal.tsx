'use client';

import React from 'react';
import { X, Calendar, ChevronRight } from 'lucide-react';

interface ArchiveItem {
  id: string;
  editionNumber: number;
  editionDate: string;
  mastheadTitle: string;
  leadHeadline: string;
  totalTokens: number;
  generationMs: number;
}

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  editions: ArchiveItem[];
  currentEditionId?: string;
  onSelectEdition: (id: string) => Promise<void>;
  isLoading: boolean;
}

export function ArchiveModal({
  isOpen,
  onClose,
  editions,
  currentEditionId,
  onSelectEdition,
  isLoading,
}: ArchiveModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Newspaper Archive</h3>
            <p className="modal-subtitle">
              Browse previously published editions generated for this reader profile.
            </p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="archive-list">
          {editions.length === 0 ? (
            <div className="archive-empty">
              <Calendar size={32} />
              <p>No historical editions yet for this reader profile.</p>
            </div>
          ) : (
            editions.map((ed) => {
              const isCurrent = currentEditionId === ed.id;
              const dateStr = new Date(ed.editionDate).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={ed.id}
                  onClick={() => !isCurrent && onSelectEdition(ed.id)}
                  className={`archive-row ${isCurrent ? 'archive-row-current' : ''}`}
                >
                  <div className="archive-meta">
                    <span className="archive-vol">EDITION #{ed.editionNumber}</span>
                    <span className="archive-date">{dateStr}</span>
                  </div>
                  <h4 className="archive-headline">{ed.leadHeadline}</h4>
                  <div className="archive-right">
                    {isCurrent ? (
                      <span className="current-badge">Currently Reading</span>
                    ) : (
                      <button className="read-btn" disabled={isLoading}>
                        <span>Read Edition</span>
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="modal-footer">
          <p className="modal-hint">
            All historical editions remain permanently stored with full source citations and provenance.
          </p>
        </div>
      </div>
    </div>
  );
}
