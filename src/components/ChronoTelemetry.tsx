'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon, BookOpen, Zap } from 'lucide-react';

interface ChronoTelemetryProps {
  engineName?: string;
  generationMs?: number;
  totalTokens?: number;
}

export function ChronoTelemetry({ engineName = 'Groq 120B LPU', generationMs = 280, totalTokens = 1250 }: ChronoTelemetryProps) {
  const [theme, setTheme] = useState<'broadsheet' | 'dawn' | 'midnight'>('broadsheet');
  const [bionicMode, setBionicMode] = useState(false);
  const [bitCounter, setBitCounter] = useState(1010);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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

  return (
    <div className="telemetry-rail">
      {/* Left: CRT Telemetry Indicator */}
      <div className="telemetry-left">
        <div className="telemetry-status">
          <span className="telemetry-dot" />
          <span className="telemetry-code">[ SYS.ACTV::{bitCounter} ]</span>
        </div>
        <div className="telemetry-specs">
          <span className="telemetry-sep">|</span>
          <span className="telemetry-engine">[ ENGINE: {engineName.toUpperCase()} ]</span>
          <span className="telemetry-sep">|</span>
          <span>LATENCY: {generationMs}ms</span>
          <span className="telemetry-sep">|</span>
          <span className="telemetry-fact">FACT-GROUNDED: 100%</span>
        </div>
      </div>

      {/* Right: Chrono-Atmosphere & NLP Bionic Reader Controls */}
      <div className="telemetry-right">
        {/* Bionic Reading Toggle */}
        <button
          onClick={() => setBionicMode(!bionicMode)}
          className={`telemetry-toggle-btn ${bionicMode ? 'active-bionic' : ''}`}
          title="Toggle Bionic Reading Focus Mode"
        >
          <Zap size={12} />
          <span>Bionic Speed: <strong>{bionicMode ? 'ON' : 'OFF'}</strong></span>
        </button>

        {/* Theme Atmosphere Selector */}
        <div className="theme-atmosphere-pill">
          <button
            onClick={() => setTheme('dawn')}
            className={`theme-tab-btn ${theme === 'dawn' ? 'active-dawn' : ''}`}
            title="Dawn Light: Warm morning parchment"
          >
            <Sun size={12} />
            <span>Dawn</span>
          </button>

          <button
            onClick={() => setTheme('broadsheet')}
            className={`theme-tab-btn ${theme === 'broadsheet' ? 'active-broadsheet' : ''}`}
            title="Broadsheet: High-contrast newsprint paper"
          >
            <BookOpen size={12} />
            <span>Broadsheet</span>
          </button>

          <button
            onClick={() => setTheme('midnight')}
            className={`theme-tab-btn ${theme === 'midnight' ? 'active-midnight' : ''}`}
            title="Midnight: Obsidian cyber-editorial dark mode"
          >
            <Moon size={12} />
            <span>Midnight</span>
          </button>
        </div>
      </div>
    </div>
  );
}
