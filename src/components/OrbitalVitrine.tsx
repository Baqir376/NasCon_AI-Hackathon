'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Compass, RotateCw, Maximize2, ShieldCheck, Cpu, Layers } from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';

export function OrbitalVitrine() {
  const [rotation, setRotation] = useState(0);
  const [tilt, setTilt] = useState(10);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startRot = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    startRot.current = rotation;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX.current;
    const newRot = Math.round((startRot.current + deltaX * 0.7) % 360);
    setRotation(newRot < 0 ? newRot + 360 : newRot);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      audioHaptics.playClick(880, 0.03);
    }
  };

  const setCardinalAngle = (angle: number) => {
    setRotation(angle);
    audioHaptics.playChime(660 + angle * 0.5, 0.25, 0.05);
  };

  return (
    <section className="orbital-vitrine-section" id="orbital-vitrine-section">
      <div className="section-header-block">
        <div className="section-tag-row">
          <span className="watermark-number">01</span>
          <span className="section-badge-pill">SPECIMEN EXHIBITION // 360° VITRINE</span>
        </div>
        <h2 className="section-title">The Sovereign Broadsheet Press Specimen</h2>
        <p className="section-desc">
          Drag horizontally or engage cardinal angles to inspect the physical geometry, deckle-edge paper grain, and cryptographic provenance watermark in full 3D space.
        </p>
      </div>

      <div
        className="vitrine-canvas-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Azimuth & Telemetry HUD */}
        <div className="vitrine-hud-bar">
          <div className="hud-metric">
            <span className="hud-label">AZIMUTH</span>
            <span className="hud-val">{rotation.toFixed(1)}°</span>
          </div>
          <div className="hud-metric">
            <span className="hud-label">PITCH TILT</span>
            <span className="hud-val">{tilt.toFixed(1)}°</span>
          </div>
          <div className="hud-metric">
            <span className="hud-label">SPECULAR CAUSTIC</span>
            <span className="hud-val">{(Math.sin((rotation * Math.PI) / 180) * 0.5 + 0.5).toFixed(2)}</span>
          </div>
          <div className="hud-metric hidden sm:block">
            <span className="hud-label">PROVENANCE ANCHOR</span>
            <span className="hud-val text-emerald-500">100% VERBATIM</span>
          </div>
        </div>

        {/* 3D Kinetic Specimen Object */}
        <div className="vitrine-viewport">
          <div
            className="specimen-3d-card"
            style={{
              transform: `perspective(1200px) rotateY(${rotation}deg) rotateX(${tilt}deg)`,
            }}
          >
            {/* Front Face: The Broadsheet Folio */}
            <div className="specimen-face specimen-front">
              <div className="specimen-masthead-mini">
                <span>VOL. I • FOLIO NO. 1</span>
                <span className="specimen-seal-dot">✦</span>
                <span>SOVEREIGN DISPATCH</span>
              </div>
              <h3 className="specimen-headline-text">
                Autonomous Source-Grounded Broadsheet Architecture
              </h3>
              <p className="specimen-para">
                Every paragraph in this newspaper is cryptographically bound to an accredited source dispatch. Zero hallucinations, finite curated scope, and print-grade broadsheet PDF parity.
              </p>
              <div className="specimen-quote-mini">
                “Veritas in curation • All claims verified to accredited source dispatches.”
              </div>
              <div className="specimen-grid-mini">
                <div className="mini-col">
                  <strong>WIRE FEED:</strong>
                  <span>Google News RSS</span>
                </div>
                <div className="mini-col">
                  <strong>SYNTHESIS:</strong>
                  <span>Groq LPU Engine</span>
                </div>
              </div>
            </div>

            {/* Back Face: Cryptographic Audit Ledger */}
            <div className="specimen-face specimen-back">
              <div className="specimen-masthead-mini">
                <span>CRYPTOGRAPHIC AUDIT LEDGER</span>
                <span>SHA-256</span>
              </div>
              <div className="specimen-hash-block">
                <code>0x8F9A7B38...E2C082</code>
              </div>
              <ul className="specimen-audit-list">
                <li>✓ Verbatim Quote Verified</li>
                <li>✓ URL Canonicalization Check</li>
                <li>✓ Shingle 3-Gram Deduplication</li>
                <li>✓ Deterministic Fallback Active</li>
              </ul>
              <div className="specimen-seal-large">⚜</div>
            </div>
          </div>
        </div>

        {/* Cardinal Angle Quick Triggers */}
        <div className="vitrine-controls-dock">
          <span className="dock-label">CARDINAL ORIENTATION:</span>
          <div className="dock-buttons">
            <button
              onClick={() => setCardinalAngle(0)}
              className={`dock-btn ${rotation === 0 ? 'active' : ''}`}
            >
              0° Front Broadsheet
            </button>
            <button
              onClick={() => setCardinalAngle(90)}
              className={`dock-btn ${rotation === 90 ? 'active' : ''}`}
            >
              90° Flank Telemetry
            </button>
            <button
              onClick={() => setCardinalAngle(180)}
              className={`dock-btn ${rotation === 180 ? 'active' : ''}`}
            >
              180° Dorsal Ledger
            </button>
            <button
              onClick={() => setCardinalAngle(270)}
              className={`dock-btn ${rotation === 270 ? 'active' : ''}`}
            >
              270° Port Ingestion
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
