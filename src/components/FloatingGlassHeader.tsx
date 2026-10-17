'use client';

import React, { useState } from 'react';
import { Sparkles, Command, Volume2, VolumeX, Mail } from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';

interface FloatingGlassHeaderProps {
  onOpenCommandPalette: () => void;
  onScrollToSection: (sectionId: string) => void;
  onOpenEmailModal?: () => void;
}

export function FloatingGlassHeader({
  onOpenCommandPalette,
  onScrollToSection,
  onOpenEmailModal,
}: FloatingGlassHeaderProps) {
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    const muted = audioHaptics.toggleMute();
    setIsMuted(muted);
  };

  const navItems = [
    { label: 'Broadsheet', id: 'newspaper-main-content' },
    { label: '360° Vitrine', id: 'orbital-vitrine-section' },
    { label: 'Math Spline', id: 'math-simulator-section' },
    { label: 'Blueprint', id: 'blueprint-section' },
    { label: 'Live Wires', id: 'telemetry-table-section' },
    { label: 'UI Foundry', id: 'ui-foundry-section' },
  ];

  return (
    <nav className="floating-glass-pill-header" aria-label="Global Architectural Navigation">
      <div className="pill-header-inner">
        {/* Brand Monogram & Live Status Pulse */}
        <div className="pill-brand-section">
          <div className="brand-monogram-badge">✦</div>
          <div className="pill-status-pulse">
            <span className="live-pulse-dot" />
            <span className="status-text hidden sm:inline">ATELIER · 60 FPS</span>
          </div>
        </div>

        {/* Section Navigation Links with Dual-Layer Kinetic Text Roll */}
        <div className="pill-nav-links hidden md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onScrollToSection(item.id)}
              onMouseEnter={() => audioHaptics.playClick(840, 0.02)}
              className="pill-nav-btn nav-roll-btn"
            >
              <span className="roll-line roll-line-1">{item.label}</span>
              <span className="roll-line roll-line-2">{item.label} ✦</span>
            </button>
          ))}
        </div>

        {/* Action Controls: Sound Haptics + Email Courier + Command Palette Trigger */}
        <div className="pill-actions-section">
          {onOpenEmailModal && (
            <button
              onClick={onOpenEmailModal}
              className="pill-nav-btn nav-roll-btn hidden sm:flex"
              title="Dispatch Morning Edition via Email Courier"
            >
              <Mail size={12} className="inline mr-1 text-amber-600 dark:text-amber-400" />
              <span>Email Courier</span>
            </button>
          )}

          <button
            onClick={toggleSound}
            className={`pill-icon-btn ${isMuted ? 'muted' : ''}`}
            title={isMuted ? 'Unmute Audio Haptics' : 'Mute Audio Haptics'}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>

          <button
            onClick={onOpenCommandPalette}
            className="pill-command-btn"
            title="Open Command Palette (Cmd+K / Ctrl+K)"
          >
            <Command size={12} />
            <span className="hidden sm:inline">Commands</span>
            <kbd className="cmd-kbd-badge">⌘K</kbd>
          </button>
        </div>
      </div>
    </nav>
  );
}
