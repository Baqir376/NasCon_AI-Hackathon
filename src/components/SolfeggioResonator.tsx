'use client';

import React, { useState } from 'react';
import { Volume2, Sparkles, Activity } from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';

interface SolfeggioKey {
  freq: number;
  label: string;
  name: string;
  color: string;
  description: string;
}

const SOLFEGGIO_KEYS: SolfeggioKey[] = [
  { freq: 528, label: '528 Hz', name: 'TRANSFORMATION', color: '#10b981', description: 'Cellular harmony & clarity' },
  { freq: 639, label: '639 Hz', name: 'COMMUNICATION', color: '#06b6d4', description: 'Curatorial interconnectedness' },
  { freq: 741, label: '741 Hz', name: 'AWAKENING', color: '#c59b27', description: 'Intuitive source discernment' },
  { freq: 852, label: '852 Hz', name: 'INTUITION', color: '#8b5cf6', description: 'Pure editorial order' },
  { freq: 963, label: '963 Hz', name: 'TRANSCENDENCE', color: '#e53935', description: 'Sovereign objective truth' },
];

export function SolfeggioResonator() {
  const [activeFreq, setActiveFreq] = useState<number | null>(null);

  const handlePlayKey = (freq: number) => {
    setActiveFreq(freq);
    audioHaptics.playHarmonic(freq, 1.2);
    setTimeout(() => setActiveFreq(null), 1200);
  };

  return (
    <section className="solfeggio-section" id="solfeggio-section">
      <div className="section-header-block">
        <div className="section-tag-row">
          <span className="watermark-number">05</span>
          <span className="section-badge-pill">ACOUSTIC HAPTICS // PROCEDURAL SYNTHESIS</span>
        </div>
        <h2 className="section-title">Playable Solfeggio Resonator Bar</h2>
        <p className="section-desc">
          Hover or tap any crystal frequency bar to synthesize pure harmonic acoustic bells using native browser Web Audio API dual-oscillators. Zero audio files loaded.
        </p>
      </div>

      <div className="solfeggio-bar-card">
        <div className="solfeggio-keys-grid">
          {SOLFEGGIO_KEYS.map((k) => {
            const isActive = activeFreq === k.freq;
            return (
              <button
                key={k.freq}
                onMouseEnter={() => handlePlayKey(k.freq)}
                onClick={() => handlePlayKey(k.freq)}
                className={`solfeggio-key-btn ${isActive ? 'active' : ''}`}
                style={{
                  borderColor: isActive ? k.color : undefined,
                  boxShadow: isActive ? `0 0 24px ${k.color}55` : undefined,
                }}
              >
                <div className="key-top-bar">
                  <span className="key-freq-num" style={{ color: k.color }}>{k.label}</span>
                  <Volume2 size={12} className="opacity-60" />
                </div>
                <div className="key-main-text">
                  <strong className="key-title">{k.name}</strong>
                  <span className="key-desc">{k.description}</span>
                </div>
                <div className="key-bottom-wave">
                  <span className={`wave-bar ${isActive ? 'animating' : ''}`} style={{ backgroundColor: k.color }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
