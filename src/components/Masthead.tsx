'use client';

import React from 'react';
import { Download, History, Sliders, Users, RefreshCw } from 'lucide-react';

interface MastheadProps {
  title: string;
  editionNumber: number;
  editionDate: string;
  currentPersonaName?: string;
  onOpenPersona: () => void;
  onOpenPreferences: () => void;
  onOpenArchive: () => void;
  onDownloadPdf: () => void;
  onRegenerate: () => void;
  isGenerating: boolean;
  providerUsed?: string;
}

export function Masthead({
  title,
  editionNumber,
  editionDate,
  currentPersonaName,
  onOpenPersona,
  onOpenPreferences,
  onOpenArchive,
  onDownloadPdf,
  onRegenerate,
  isGenerating,
  providerUsed,
}: MastheadProps) {
  const formattedDate = new Date(editionDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="newspaper-masthead">
      {/* Top utility ticker */}
      <div className="masthead-top-bar">
        <div className="top-bar-left">
          <span className="ticker-badge">DAILY EDITION</span>
          <span className="ticker-text">FACT-CHECKED & SOURCE-GROUNDED JOURNALISM</span>
        </div>
        <div className="top-bar-right">
          {providerUsed && (
            <span className="provider-pill">
              Engine: <strong>{providerUsed.toUpperCase()}</strong>
            </span>
          )}
          <button
            onClick={onOpenPersona}
            className="action-btn action-btn-persona"
            title="Switch demo persona for testing"
          >
            <Users size={14} />
            <span>Reader: <strong>{currentPersonaName || 'Guest'}</strong></span>
          </button>
        </div>
      </div>

      {/* Primary Newspaper Title Banner */}
      <div className="masthead-main">
        <p className="masthead-sub-tag">The Autonomous Daily Digest</p>
        <h1 className="masthead-headline">{title.toUpperCase()}</h1>
        <p className="masthead-motto">“VERITAS IN CURATION • ALL STORIES VERIFIED TO PRIMARY SOURCES”</p>
      </div>

      {/* Bottom Editorial Dateline & Controls */}
      <div className="masthead-dateline-bar">
        <div className="dateline-left">
          <span>VOL. I • NO. {editionNumber}</span>
          <span className="dateline-divider">•</span>
          <span>{formattedDate.toUpperCase()}</span>
        </div>
        <div className="dateline-controls">
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="control-btn"
            title="Generate fresh morning edition"
          >
            <RefreshCw size={14} className={isGenerating ? 'spin' : ''} />
            <span>{isGenerating ? 'Synthesizing...' : 'Fresh Edition'}</span>
          </button>

          <button
            onClick={onDownloadPdf}
            className="control-btn control-btn-primary"
            title="Download broadsheet newspaper PDF"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>

          <button
            onClick={onOpenPreferences}
            className="control-btn"
            title="Edit topic interests and reading depth"
          >
            <Sliders size={14} />
            <span>Topics</span>
          </button>

          <button
            onClick={onOpenArchive}
            className="control-btn"
            title="Browse previous editions"
          >
            <History size={14} />
            <span>Archive</span>
          </button>
        </div>
      </div>
    </header>
  );
}
