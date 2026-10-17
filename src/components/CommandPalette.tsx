'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Download, History, Sliders, Users, Sun, Moon, Palette, Compass, Activity, Volume2, ShieldCheck, X, Mail, BookOpen } from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';

export interface CommandItem {
  id: string;
  category: 'Dispatch' | 'Atmosphere' | 'Foundry' | 'Navigation';
  title: string;
  subtitle?: string;
  hotkey?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: () => void;
  onDownloadPdf: () => void;
  onOpenPreferences: () => void;
  onOpenArchive: () => void;
  onOpenPersona: () => void;
  onSelectTheme: (themeId: string) => void;
  onScrollToSection: (sectionId: string) => void;
  onOpenEmailModal?: () => void;
  onOpenReaderLead?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onRegenerate,
  onDownloadPdf,
  onOpenPreferences,
  onOpenArchive,
  onOpenPersona,
  onSelectTheme,
  onScrollToSection,
  onOpenEmailModal,
  onOpenReaderLead,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'dispatch-email',
      category: 'Dispatch',
      title: 'Dispatch Edition via Email Courier',
      subtitle: 'Deliver formatted broadsheet digest directly to personal inbox',
      hotkey: '⌘E',
      icon: <Mail size={14} className="text-amber-500" />,
      action: () => {
        if (onOpenEmailModal) onOpenEmailModal();
        onClose();
      },
    },
    {
      id: 'read-lead',
      category: 'Dispatch',
      title: 'Open Broadsheet Reading Room',
      subtitle: 'Immersive tactile paper reader with audio narration & primary wire source',
      hotkey: 'Space',
      icon: <BookOpen size={14} className="text-indigo-500" />,
      action: () => {
        if (onOpenReaderLead) onOpenReaderLead();
        onClose();
      },
    },
    {
      id: 'dispatch-fresh',
      category: 'Dispatch',
      title: 'Issue Morning Folio',
      subtitle: 'Synthesize fresh fact-grounded autonomous newspaper dispatch',
      hotkey: '⌘R',
      icon: <Sparkles size={14} className="text-amber-500" />,
      action: () => { onRegenerate(); onClose(); },
    },
    {
      id: 'export-pdf',
      category: 'Dispatch',
      title: 'Cold-Press Lithograph [PDF]',
      subtitle: 'Export print-grade broadsheet archival edition',
      hotkey: '⌘P',
      icon: <Download size={14} className="text-emerald-500" />,
      action: () => { onDownloadPdf(); onClose(); },
    },
    {
      id: 'open-archive',
      category: 'Dispatch',
      title: 'Access Editions Ledger & Vault',
      subtitle: 'Browse all previously published sovereign morning editions',
      icon: <History size={14} className="text-blue-500" />,
      action: () => { onOpenArchive(); onClose(); },
    },
    {
      id: 'curatorial-aperture',
      category: 'Dispatch',
      title: 'Calibrate Curatorial Aperture',
      subtitle: 'Tune subject beats, reading depth, and serendipity modes',
      icon: <Sliders size={14} className="text-purple-500" />,
      action: () => { onOpenPreferences(); onClose(); },
    },
    {
      id: 'intelligence-envoy',
      category: 'Dispatch',
      title: 'Summon Intelligence Envoy',
      subtitle: 'Switch reader persona profile for personalized synthesis',
      icon: <Users size={14} className="text-rose-500" />,
      action: () => { onOpenPersona(); onClose(); },
    },
    // Theme options
    {
      id: 'theme-broadsheet',
      category: 'Atmosphere',
      title: 'Theme: Classic Broadsheet Ivory & Ink',
      subtitle: 'High-contrast unbleached rag paper with carbon ink',
      icon: <Sun size={14} className="text-amber-600" />,
      action: () => { onSelectTheme('broadsheet'); onClose(); },
    },
    {
      id: 'theme-red-charcoal',
      category: 'Atmosphere',
      title: 'Theme: Red & Charcoal (Bespoke Luxury Dark)',
      subtitle: 'Matte obsidian charcoal canvas with liquid crimson red accents',
      icon: <Moon size={14} className="text-red-500" />,
      action: () => { onSelectTheme('dark-charcoal'); onClose(); },
    },
    {
      id: 'theme-olive',
      category: 'Atmosphere',
      title: 'Theme: Dark Olive & Cream',
      subtitle: 'Deep Mediterranean olive canvas layered with warm clotted cream',
      icon: <Palette size={14} className="text-emerald-600" />,
      action: () => { onSelectTheme('olive-cream'); onClose(); },
    },
    {
      id: 'theme-copper-teal',
      category: 'Atmosphere',
      title: 'Theme: Burnished Copper & Midnight Teal',
      subtitle: 'Abyssal oceanic teal with glowing molten burnished copper',
      icon: <Palette size={14} className="text-orange-500" />,
      action: () => { onSelectTheme('copper-teal'); onClose(); },
    },
    {
      id: 'theme-forest-concrete',
      category: 'Atmosphere',
      title: 'Theme: Forest Teal & Light Concrete Grey',
      subtitle: 'Architectural concrete paper with deep alpine forest teal ink',
      icon: <Palette size={14} className="text-teal-600" />,
      action: () => { onSelectTheme('forest-concrete'); onClose(); },
    },
    {
      id: 'theme-whiteoak',
      category: 'Atmosphere',
      title: 'Theme: Natural White Oak & Travertine',
      subtitle: 'Natural travertine stone with smoked white oak woodcut typography',
      icon: <Palette size={14} className="text-stone-600" />,
      action: () => { onSelectTheme('whiteoak-travertine'); onClose(); },
    },
    // Navigation jumps
    {
      id: 'nav-vitrine',
      category: 'Foundry',
      title: 'Specimen: 360° Kinetic Orbital Vitrine',
      subtitle: 'Interactive 3D virtual broadsheet press specimen exhibition',
      icon: <Compass size={14} className="text-cyan-500" />,
      action: () => { onScrollToSection('orbital-vitrine-section'); onClose(); },
    },
    {
      id: 'nav-math-sim',
      category: 'Foundry',
      title: 'Living Math: Curatorial Bézier Simulator',
      subtitle: 'Real-time mathematical resonance curves and dynamic spline paths',
      icon: <Activity size={14} className="text-amber-500" />,
      action: () => { onScrollToSection('math-simulator-section'); onClose(); },
    },
    {
      id: 'nav-blueprint',
      category: 'Foundry',
      title: 'Architecture: Autonomous Newsroom Blueprint',
      subtitle: 'Spatial schematic with interactive telemetry hotspot pins',
      icon: <ShieldCheck size={14} className="text-emerald-500" />,
      action: () => { onScrollToSection('blueprint-section'); onClose(); },
    },
    {
      id: 'nav-data-table',
      category: 'Foundry',
      title: 'Telemetry: High-Density Live Wires Feed',
      subtitle: 'Filterable data matrix of accredited primary wire dispatches',
      icon: <Search size={14} className="text-indigo-500" />,
      action: () => { onScrollToSection('telemetry-table-section'); onClose(); },
    },
    {
      id: 'nav-foundry-ui',
      category: 'Foundry',
      title: 'Exhibition: The Complete UI Element Foundry',
      subtitle: 'Tactile buttons, floating-label inputs, gauges, and switches',
      icon: <Sparkles size={14} className="text-rose-500" />,
      action: () => { onScrollToSection('ui-foundry-section'); onClose(); },
    },
  ];

  const filtered = commands.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      audioHaptics.playChime(740, 0.25, 0.06);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
        audioHaptics.playClick(920, 0.02);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
        audioHaptics.playClick(920, 0.02);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          audioHaptics.playChime(880, 0.3, 0.08);
          filtered[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  // Lock body scroll and pause Lenis while Command Palette is open
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
      className="cmd-backdrop"
      data-lenis-prevent="true"
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        className="cmd-palette-modal"
        data-lenis-prevent="true"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="cmd-input-container">
          <Search size={16} className="cmd-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input-field"
            placeholder="Type a command, jump to section, or switch theme..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button onClick={onClose} className="cmd-close-btn" title="Close Command Palette (Esc)">
            <X size={14} />
          </button>
        </div>

        {/* Results List */}
        <div
          className="cmd-results-list"
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
        >
          {filtered.length === 0 ? (
            <div className="cmd-empty-state">
              <p>No commands matching &ldquo;{query}&rdquo;</p>
              <span>Try searching for &quot;Theme&quot;, &quot;Folio&quot;, &quot;Vitrine&quot;, or &quot;Foundry&quot;</span>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    audioHaptics.playChime(880, 0.3, 0.08);
                    item.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`cmd-item ${isSelected ? 'selected' : ''}`}
                >
                  <div className="cmd-item-left">
                    <span className="cmd-item-icon">{item.icon}</span>
                    <div className="cmd-item-content">
                      <span className="cmd-item-title">{item.title}</span>
                      {item.subtitle && <span className="cmd-item-subtitle">{item.subtitle}</span>}
                    </div>
                  </div>
                  <div className="cmd-item-right">
                    <span className="cmd-category-tag">{item.category}</span>
                    {item.hotkey && <span className="cmd-hotkey-badge">{item.hotkey}</span>}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hotkeys Reference */}
        <div className="cmd-palette-footer">
          <div className="cmd-footer-hints">
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>ESC</kbd> Dismiss</span>
          </div>
          <span className="cmd-footer-branding">SOVEREIGN ATELIER // KINETIC FOUNDRY</span>
        </div>
      </div>
    </div>
  );
}
