'use client';

import React, { useState, useMemo } from 'react';
import { Sliders, Activity, Zap, ShieldAlert, CheckCircle } from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';

export function BezierMathSimulator() {
  const [aperture, setAperture] = useState(48); // 10 to 100 articles
  const [groundingWeight, setGroundingWeight] = useState(98); // 85% to 100%
  const [synthesisSpeed, setSynthesisSpeed] = useState(420); // 150 to 650 tok/sec

  // Calculate dynamic resonance and Bézier coordinate points
  const mathOutput = useMemo(() => {
    const rawResonance = (aperture * 0.4 + (groundingWeight - 85) * 4.5 + (synthesisSpeed / 650) * 25).toFixed(1);
    const tokenEfficiency = ((aperture * 320) / (synthesisSpeed * 0.08)).toFixed(0);

    // Compute SVG Bézier Spline coordinates
    const p1 = { x: 30, y: 180 - aperture * 1.1 };
    const cp1 = { x: 180, y: 220 - (groundingWeight - 85) * 8.5 };
    const cp2 = { x: 380, y: 60 + (650 - synthesisSpeed) * 0.22 };
    const p2 = { x: 570, y: 160 - aperture * 0.9 };

    const svgPath = `M ${p1.x},${p1.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${p2.x},${p2.y}`;
    const fillPath = `${svgPath} L 570,220 L 30,220 Z`;

    return {
      resonance: rawResonance,
      efficiency: tokenEfficiency,
      svgPath,
      fillPath,
      cp1,
      cp2,
    };
  }, [aperture, groundingWeight, synthesisSpeed]);

  const handleSliderChange = (setter: React.Dispatch<React.SetStateAction<number>>, val: number) => {
    setter(val);
    audioHaptics.playClick(600 + val * 4, 0.02);
  };

  return (
    <section className="math-simulator-section" id="math-simulator-section">
      <div className="section-header-block">
        <div className="section-tag-row">
          <span className="watermark-number">02</span>
          <span className="section-badge-pill">LIVING MATHEMATICAL SIMULATOR // BÉZIER SPLINES</span>
        </div>
        <h2 className="section-title">Autonomous Curatorial Velocity Engine</h2>
        <p className="section-desc">
          Slide parameters to recalculate curatorial resonance in real time. The SVG cubic Bézier spline recalculates polynomial coordinates continuously with mechanical counter rolling.
        </p>
      </div>

      <div className="math-grid-container">
        {/* Left: Interactive Range Sliders */}
        <div className="math-controls-card">
          <div className="math-control-group">
            <div className="control-label-row">
              <span className="control-name">Ingestion Harvest Aperture</span>
              <span className="control-val">{aperture} articles</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={aperture}
              onChange={(e) => handleSliderChange(setAperture, Number(e.target.value))}
              className="tactile-range-slider"
            />
            <div className="control-hint">Feeds ingested from Google News RSS Technology & Science wires</div>
          </div>

          <div className="math-control-group">
            <div className="control-label-row">
              <span className="control-name">Fact-Grounding Verbatim Weight</span>
              <span className="control-val text-emerald-500">{groundingWeight}%</span>
            </div>
            <input
              type="range"
              min={85}
              max={100}
              value={groundingWeight}
              onChange={(e) => handleSliderChange(setGroundingWeight, Number(e.target.value))}
              className="tactile-range-slider"
            />
            <div className="control-hint">Sub-string exactness required to accept LLM-synthesized narrative summaries</div>
          </div>

          <div className="math-control-group">
            <div className="control-label-row">
              <span className="control-name">Groq LPU Synthesis Velocity</span>
              <span className="control-val text-amber-500">{synthesisSpeed} tok/s</span>
            </div>
            <input
              type="range"
              min={150}
              max={650}
              value={synthesisSpeed}
              onChange={(e) => handleSliderChange(setSynthesisSpeed, Number(e.target.value))}
              className="tactile-range-slider"
            />
            <div className="control-hint">Inference speed across concurrent section summarization pipelines</div>
          </div>

          {/* Quick Stats Summary */}
          <div className="math-stats-duo">
            <div className="stat-pill">
              <span className="stat-label">CURATORIAL RESONANCE</span>
              <span className="stat-number">{mathOutput.resonance}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">TOKEN EFFICIENCY RATIO</span>
              <span className="stat-number">{mathOutput.efficiency} pts</span>
            </div>
          </div>
        </div>

        {/* Right: Dynamic SVG Bézier Spline Graph */}
        <div className="math-graph-card">
          <div className="graph-top-bar">
            <div className="graph-badge">
              <Activity size={12} className="pulse-dot text-amber-500" />
              <span>ACTIVE POLYNOMIAL SPLINE // CUBIC BÉZIER</span>
            </div>
            <span className="graph-coords">
              CP1: [{mathOutput.cp1.x}, {mathOutput.cp1.y.toFixed(0)}] · CP2: [{mathOutput.cp2.x}, {mathOutput.cp2.y.toFixed(0)}]
            </span>
          </div>

          <div className="svg-graph-viewport">
            <svg viewBox="0 0 600 240" className="bezier-svg-element">
              <defs>
                <linearGradient id="splineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e53935" />
                  <stop offset="50%" stopColor="#c59b27" />
                  <stop offset="100%" stopColor="#0f4c81" />
                </linearGradient>
                <linearGradient id="splineAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(229, 57, 53, 0.25)" />
                  <stop offset="100%" stopColor="rgba(229, 57, 53, 0.0)" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="30" y1="50" x2="570" y2="50" stroke="var(--border-light)" strokeDasharray="4 4" strokeWidth="0.8" />
              <line x1="30" y1="110" x2="570" y2="110" stroke="var(--border-light)" strokeDasharray="4 4" strokeWidth="0.8" />
              <line x1="30" y1="170" x2="570" y2="170" stroke="var(--border-light)" strokeDasharray="4 4" strokeWidth="0.8" />
              <line x1="30" y1="220" x2="570" y2="220" stroke="var(--ink-border)" strokeWidth="1.2" />

              {/* Filled Area under Curve */}
              <path d={mathOutput.fillPath} fill="url(#splineAreaGradient)" />

              {/* Dynamic Recalculated Bézier Curve */}
              <path
                d={mathOutput.svgPath}
                fill="none"
                stroke="url(#splineGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Dynamic Control Points */}
              <circle cx={mathOutput.cp1.x} cy={mathOutput.cp1.y} r="5" fill="#c59b27" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx={mathOutput.cp2.x} cy={mathOutput.cp2.y} r="5" fill="#e53935" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="graph-footer-notes">
            <span>Polynomial: $f(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t)t^2 P_2 + t^3 P_3$</span>
            <span className="status-nominal">NOMINAL CONVERGENCE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
