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
      <div className="masthead-main flex items-center justify-between">
        <div className="masthead-seal hidden sm:block">
          <svg viewBox="0 0 100 100" className="rotating-seal">
            <path id="seal-circle" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
            <text className="seal-text">
              <textPath xlinkHref="#seal-circle">
                ★ VERITAS IN CURATION ★ MORNING PAPER ★
              </textPath>
            </text>
          </svg>
          <div className="seal-center">✦</div>
        </div>

        <div className="flex-1 text-center">
          <p className="masthead-sub-tag">The Autonomous Daily Digest</p>
          <h1 className="masthead-headline">{title.toUpperCase()}</h1>
          <p className="masthead-motto">“VERITAS IN CURATION • ALL STORIES VERIFIED TO PRIMARY SOURCES”</p>
        </div>

        <div className="masthead-seal hidden sm:block opacity-80">
          <svg viewBox="0 0 100 100" className="rotating-seal" style={{ animationDirection: 'reverse' }}>
            <path id="seal-circle-2" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
            <text className="seal-text">
              <textPath xlinkHref="#seal-circle-2">
                ★ VOL. I • EST. 2026 ★ FACT GROUNDED ★
              </textPath>
            </text>
          </svg>
          <div className="seal-center">⚜</div>
        </div>
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
