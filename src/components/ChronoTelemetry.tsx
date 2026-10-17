'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, BookOpen, Zap, ChevronDown, Check, Palette } from 'lucide-react';

export interface ColorThemeOption {
  id: string;
  name: string;
  category: 'Light' | 'Dark' | 'Earthy' | 'Bespoke';
  primaryColor: string;
  secondaryColor: string;
  description: string;
}

export const COLOR_THEMES: ColorThemeOption[] = [
  {
    id: 'broadsheet',
    name: 'Classic Broadsheet',
    category: 'Light',
    primaryColor: '#FCFBF7',
    secondaryColor: '#141414',
    description: 'Crisp unbleached newsprint paper with dark carbon ink and heritage burgundy accents.',
  },
  {
    id: 'dark-charcoal',
    name: 'Red & Charcoal',
    category: 'Dark',
    primaryColor: '#0E0F12',
    secondaryColor: '#E53935',
    description: 'Smoked matte charcoal backdrop energized by vibrant liquid crimson red and pale parchment typography.',
  },
  {
    id: 'olive-cream',
    name: 'Dark Olive & Cream',
    category: 'Earthy',
    primaryColor: '#1B2019',
    secondaryColor: '#FDF8E6',
    description: 'Noble dark Mediterranean olive canvas layered with warm clotted cream editorial text.',
  },
  {
    id: 'copper-teal',
    name: 'Burnished Copper & Midnight Teal',
    category: 'Dark',
    primaryColor: '#09161A',
    secondaryColor: '#D97746',
    description: 'Deep abyssal oceanic teal illuminated by molten burnished copper highlights.',
  },
  {
    id: 'forest-concrete',
    name: 'Forest Teal & Light Concrete Grey',
    category: 'Light',
    primaryColor: '#E8ECEB',
    secondaryColor: '#0E4A46',
    description: 'Cool architectural concrete grey paper set against high-density alpine forest teal ink.',
  },
  {
    id: 'whiteoak-travertine',
    name: 'Natural White Oak & Travertine',
    category: 'Bespoke',
    primaryColor: '#F4EFE6',
    secondaryColor: '#8A6240',
    description: 'Tactile travertine stone surface balanced with smoked white oak woodcut typography.',
  },
];

interface ChronoTelemetryProps {
  engineName?: string;
  generationMs?: number;
  totalTokens?: number;
}

export function ChronoTelemetry({
  engineName = 'Groq 120B LPU',
  generationMs = 280,
  totalTokens = 1250,
}: ChronoTelemetryProps) {
  const [currentTheme, setCurrentTheme] = useState<string>('broadsheet');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [bionicMode, setBionicMode] = useState(false);
  const [bitCounter, setBitCounter] = useState(1010);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize theme from localStorage or default
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('morning-paper-theme');
      if (saved && COLOR_THEMES.some((t) => t.id === saved)) {
        setCurrentTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
      } else {
        document.documentElement.setAttribute('data-theme', 'broadsheet');
      }
    }
  }, []);

  // Update theme & save
  const handleSelectTheme = (themeId: string) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('morning-paper-theme', themeId);
    }
    setIsDropdownOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apply bionic reading mode
  useEffect(() => {
    document.documentElement.setAttribute('data-bionic', bionicMode ? 'true' : 'false');
  }, [bionicMode]);

  // Subtle live CRT bit stream ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setBitCounter((prev) => (prev > 9990 ? 1010 : prev + 17));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const activeThemeObj = COLOR_THEMES.find((t) => t.id === currentTheme) || COLOR_THEMES[0];

  return (
    <div className="telemetry-rail" data-cursor="Telemetry">
      {/* Left: CRT Telemetry Indicator */}
      <div className="telemetry-left">
        <div className="telemetry-status">
          <span className="telemetry-dot" />
          <span className="telemetry-code">[ SYS.ACTV::{bitCounter} ]</span>
        </div>
        <div className="telemetry-specs">
          <span className="telemetry-sep">|</span>
          <span className="telemetry-engine" title="Synthesis Pipeline Engine">
            [ ENGINE: {engineName.toUpperCase()} ]
          </span>
          <span className="telemetry-sep">|</span>
          <span>LATENCY: {generationMs}ms</span>
          <span className="telemetry-sep">|</span>
          <span className="telemetry-fact">FACT-GROUNDED: 100%</span>
        </div>
      </div>

      {/* Right: Chrono-Atmosphere & Bespoke Color Theme Dropdown */}
      <div className="telemetry-right">
        {/* Bionic Reading Toggle */}
        <button
          onClick={() => setBionicMode(!bionicMode)}
          className={`telemetry-toggle-btn ${bionicMode ? 'active-bionic' : ''}`}
          title="Toggle Bionic Reading Focus Mode"
          data-cursor="Bionic Toggle"
        >
          <Zap size={11} />
          <span>Bionic Speed: <strong>{bionicMode ? 'ON' : 'OFF'}</strong></span>
        </button>

        {/* Bespoke Color Theme Dropdown */}
        <div className="theme-dropdown-container" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="theme-dropdown-trigger"
            title="Select bespoke atmospheric color palette"
            data-cursor="Theme Palette"
            aria-expanded={isDropdownOpen}
          >
            <div className="theme-swatch-duo">
              <span
                className="swatch-half swatch-primary"
                style={{ backgroundColor: activeThemeObj.primaryColor }}
              />
              <span
                className="swatch-half swatch-secondary"
                style={{ backgroundColor: activeThemeObj.secondaryColor }}
              />
            </div>
            <span className="theme-trigger-name">{activeThemeObj.name}</span>
            <ChevronDown size={12} className={`chevron-icon ${isDropdownOpen ? 'open' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div
              className="theme-dropdown-menu"
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="theme-dropdown-header">
                <Palette size={12} className="text-amber-500" />
                <span>EDITORIAL ATMOSPHERE & COLOR SCHEMES</span>
              </div>
              <div
                className="theme-options-list"
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
              >
                {COLOR_THEMES.map((theme) => {
                  const isSelected = theme.id === currentTheme;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`theme-option-item ${isSelected ? 'selected' : ''}`}
                      data-cursor={`Select ${theme.name}`}
                    >
                      <div className="theme-option-left">
                        <div className="theme-option-swatch">
                          <span
                            className="swatch-half swatch-primary"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <span
                            className="swatch-half swatch-secondary"
                            style={{ backgroundColor: theme.secondaryColor }}
                          />
                        </div>
                        <div className="theme-option-text">
                          <div className="theme-option-title-row">
                            <span className="theme-option-title">{theme.name}</span>
                            <span className="theme-option-category">{theme.category}</span>
                          </div>
                          <p className="theme-option-desc">{theme.description}</p>
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="theme-check-icon" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
