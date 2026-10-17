'use client';

import React from 'react';
import { Download, History, Sliders, Users, RefreshCw, Feather, ShieldCheck, Mail } from 'lucide-react';

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
  onOpenEmailModal?: () => void;
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
  onOpenEmailModal,
}: MastheadProps) {
  const formattedDate = new Date(editionDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="newspaper-masthead">
      {/* Top Telemetry & Intelligence Envoy Header */}
      <div className="masthead-top-bar">
        <div className="top-bar-left">
          <span className="ticker-badge">SOVEREIGN DISPATCH</span>
          <span className="ticker-text">FACT-GROUNDED AUTONOMOUS BROADSHEET • PRIMARY SOURCE ANCHORED</span>
        </div>
        <div className="top-bar-right">
          {providerUsed && (
            <span className="provider-pill" title="Active LLM Synthesis Engine">
              <span className="pulse-indicator"></span>
              SYNTHESIS: <strong>{providerUsed.toUpperCase()}</strong>
            </span>
          )}
          <button
            onClick={onOpenPersona}
            className="action-btn action-btn-persona"
            title="Switch intelligence reading persona"
            data-cursor="Switch Envoy"
          >
            <Users size={13} />
            <span>INTELLIGENCE ENVOY: <strong>{currentPersonaName || 'Guest Scholar'}</strong></span>
          </button>
        </div>
      </div>

      {/* Primary Newspaper Title Banner with Dual Rotating Seals */}
      <div className="masthead-main flex items-center justify-between">
        {/* Left Guild Seal */}
        <div className="masthead-seal hidden sm:block" title="Cryptographically Grounded Newsroom Seal">
          <svg viewBox="0 0 100 100" className="rotating-seal">
            <path id="seal-circle-left" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
            <text className="seal-text">
              <textPath xlinkHref="#seal-circle-left">
                ★ VERITAS IN CURATION ★ THE MORNING DISPATCH ★
              </textPath>
            </text>
          </svg>
          <div className="seal-center">✦</div>
        </div>

        {/* Center Typography */}
        <div className="flex-1 text-center masthead-title-block">
          <div className="masthead-sub-tag">
            <span>THE AUTONOMOUS MORNING CHRONICLE</span>
            <span className="meta-sep">/</span>
            <span>GROUNDED JOURNALISM</span>
          </div>
          <h1 className="masthead-headline tracking-wide">
            {title.toUpperCase()}
          </h1>
          <p className="masthead-motto">
            “VERITAS IN CURATION • EVERY PARAGRAPH TRACEABLE TO AN ACCREDITED DISPATCH”
          </p>
        </div>

        {/* Right Guild Seal */}
        <div className="masthead-seal hidden sm:block opacity-90" title="Verifiable Source Provenance Guild Seal">
          <svg viewBox="0 0 100 100" className="rotating-seal seal-reverse">
            <path id="seal-circle-right" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
            <text className="seal-text">
              <textPath xlinkHref="#seal-circle-right">
                ★ SOURCE GROUNDED ★ FACT HARVESTED ★ EST. 2026 ★
              </textPath>
            </text>
          </svg>
          <div className="seal-center">⚜</div>
        </div>
      </div>

      {/* Editorial Dateline & Bespoke Dispatch Controls */}
      <div className="masthead-dateline-bar">
        <div className="dateline-left">
          <span className="volume-tag">VOL. I • NO. {editionNumber}</span>
          <span className="dateline-divider">✦</span>
          <span className="date-tag">{formattedDate.toUpperCase()}</span>
          <span className="dateline-divider hidden md:inline">✦</span>
          <span className="origin-tag hidden md:inline">METROPOLITAN BUREAU</span>
        </div>

        <div className="dateline-controls">
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="control-btn control-btn-dispatch"
            title="Synthesize today's fresh autonomous news dispatch"
            data-cursor="Generate"
          >
            <RefreshCw size={13} className={isGenerating ? 'spin' : ''} />
            <span>{isGenerating ? 'Synthesizing...' : 'Issue Morning Folio'}</span>
          </button>

          <button
            onClick={onDownloadPdf}
            className="control-btn control-btn-primary"
            title="Download cold-press print-grade broadsheet archival edition"
            data-cursor="Lithograph PDF"
          >
            <Download size={13} />
            <span>Cold-Press Lithograph [PDF]</span>
          </button>

          {onOpenEmailModal && (
            <button
              onClick={onOpenEmailModal}
              className="control-btn"
              title="Dispatch this morning edition directly to your inbox"
              data-cursor="Email Courier"
            >
              <Mail size={13} className="text-amber-600 dark:text-amber-400" />
              <span>Email Courier</span>
            </button>
          )}

          <button
            onClick={onOpenPreferences}
            className="control-btn"
            title="Calibrate curatorial frequency and topic bias"
            data-cursor="Aperture"
          >
            <Sliders size={13} />
            <span>Curatorial Aperture</span>
          </button>

          <button
            onClick={onOpenArchive}
            className="control-btn"
            title="Inspect historical editions ledger and provenance vault"
            data-cursor="Vault"
          >
            <History size={13} />
            <span>Editions Ledger</span>
          </button>
        </div>
      </div>
    </header>
  );
}
