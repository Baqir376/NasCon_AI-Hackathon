'use client';

import React, { useState } from 'react';
import { Sparkles, Check, ChevronDown, Plus, Minus, Search, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';

export function UIElementFoundry() {
  // Foundry interactive states
  const [toggleState, setToggleState] = useState(true);
  const [checkboxState, setCheckboxState] = useState(true);
  const [radioState, setRadioState] = useState('folio');
  const [stepperVal, setStepperVal] = useState(8);
  const [activeTab, setActiveTab] = useState('broadsheet');
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const triggerHaptic = (freq = 820) => audioHaptics.playClick(freq, 0.03);

  return (
    <section className="ui-foundry-section" id="ui-foundry-section">
      <div className="section-header-block">
        <div className="section-tag-row">
          <span className="watermark-number">06</span>
          <span className="section-badge-pill">COMPLETE ELEMENT FOUNDRY // UI COMPONENT MATRIX</span>
        </div>
        <h2 className="section-title">The Sovereign Design System Foundry</h2>
        <p className="section-desc">
          Every control in the application engineered with tactile physical feedback, specular border reflections, and zero-compromise dual-theme fidelity.
        </p>
      </div>

      <div className="foundry-grid">
        {/* Module A: Button Matrix */}
        <div className="foundry-card">
          <h3 className="foundry-card-title">01. TACTILE BUTTON MATRIX</h3>
          <p className="foundry-card-sub">Six bespoke button archetypes with spring dampening and kinetic text roll</p>

          <div className="foundry-flex-wrap">
            <button
              onMouseEnter={() => triggerHaptic(840)}
              onClick={() => audioHaptics.playChime(880, 0.3, 0.08)}
              className="foundry-btn btn-specular-primary"
            >
              <span>Specular Magnetic Button</span>
            </button>

            <button
              onMouseEnter={() => triggerHaptic(800)}
              onClick={() => audioHaptics.playChime(660, 0.25, 0.06)}
              className="foundry-btn btn-frosted-glass"
            >
              <span>Frosted Glassmorphism</span>
            </button>

            <button
              onMouseEnter={() => triggerHaptic(780)}
              className="foundry-btn btn-dual-roll nav-roll-btn"
            >
              <span className="roll-line roll-line-1">Kinetic Dual-Layer</span>
              <span className="roll-line roll-line-2">Sliding Surface ✦</span>
            </button>

            <button
              onMouseEnter={() => triggerHaptic(920)}
              onClick={() => audioHaptics.playChime(440, 0.4, 0.1)}
              className="foundry-btn btn-destructive-hazard"
            >
              <AlertTriangle size={13} />
              <span>Hazard Redline</span>
            </button>

            <button
              onMouseEnter={() => triggerHaptic(760)}
              className="foundry-btn btn-titanium-outline"
            >
              <span>Titanium Hairline</span>
            </button>
          </div>
        </div>

        {/* Module B: Inputs & Form Controls */}
        <div className="foundry-card">
          <h3 className="foundry-card-title">02. INPUTS & LUXURY CONTROLS</h3>
          <p className="foundry-card-sub">Floating-label border notches, search shortcuts, and numeric steppers</p>

          <div className="foundry-col-stack">
            {/* Floating Label Input */}
            <div className={`floating-input-group ${isInputFocused || inputValue ? 'active-floating' : ''}`}>
              <label className="floating-label">DISPATCH WIRE FREQUENCY</label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => { setIsInputFocused(true); triggerHaptic(750); }}
                onBlur={() => setIsInputFocused(false)}
                className="floating-text-input"
                placeholder={isInputFocused ? 'e.g. 24h Synchronous Batch' : ''}
              />
            </div>

            {/* Tactile Numeric Stepper */}
            <div className="stepper-row">
              <span className="stepper-label">CURATED SECTION LIMIT</span>
              <div className="stepper-controls">
                <button
                  onClick={() => {
                    if (stepperVal > 1) {
                      setStepperVal(stepperVal - 1);
                      triggerHaptic(620);
                    }
                  }}
                  className="stepper-btn"
                  title="Decrease Limit"
                >
                  <Minus size={12} />
                </button>
                <span className="stepper-val-num">{stepperVal} stories</span>
                <button
                  onClick={() => {
                    if (stepperVal < 20) {
                      setStepperVal(stepperVal + 1);
                      triggerHaptic(740);
                    }
                  }}
                  className="stepper-btn"
                  title="Increase Limit"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Module C: Switches, Checkboxes & Segmented Tabs */}
        <div className="foundry-card">
          <h3 className="foundry-card-title">03. SWITCHES & SELECTORS</h3>
          <p className="foundry-card-sub">Linear glide toggles, animated SVG check strokes, and segmented controls</p>

          <div className="foundry-col-stack">
            {/* Segmented Control */}
            <div className="segmented-control-bar">
              {['broadsheet', 'tabloid', 'archive'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    triggerHaptic(820);
                  }}
                  className={`segment-btn ${activeTab === tab ? 'active' : ''}`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Toggle + Checkbox Row */}
            <div className="switches-row">
              {/* Precision Toggle */}
              <label className="switch-item-label cursor-pointer" onClick={() => {
                setToggleState(!toggleState);
                audioHaptics.playClick(toggleState ? 600 : 850, 0.04);
              }}>
                <div className={`precision-toggle-track ${toggleState ? 'active-track' : ''}`}>
                  <span className={`precision-toggle-thumb ${toggleState ? 'active-thumb' : ''}`} />
                </div>
                <span className="switch-text">Bionic Reader Glides</span>
              </label>

              {/* Animated Vector Checkbox */}
              <label className="checkbox-item-label cursor-pointer" onClick={() => {
                setCheckboxState(!checkboxState);
                triggerHaptic(800);
              }}>
                <div className={`vector-checkbox-box ${checkboxState ? 'checked' : ''}`}>
                  {checkboxState && <Check size={11} className="check-svg" />}
                </div>
                <span className="switch-text">Strict Verbatim Verification</span>
              </label>
            </div>
          </div>
        </div>

        {/* Module D: Radial Gauges & Status Palette */}
        <div className="foundry-card">
          <h3 className="foundry-card-title">04. GAUGES & STATUS HIERARCHY</h3>
          <p className="foundry-card-sub">Calculated SVG circular stroke gauges and chromatic status indicators</p>

          <div className="foundry-flex-center">
            {/* SVG Radial Gauge Meter */}
            <div className="radial-gauge-container">
              <svg viewBox="0 0 100 100" className="radial-gauge-svg">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-light)" strokeWidth="6" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth="6"
                  strokeDasharray="264"
                  strokeDashoffset="26.4"
                  strokeLinecap="round"
                  className="gauge-active-stroke"
                />
              </svg>
              <div className="gauge-center-text">
                <span className="gauge-val">90%</span>
                <span className="gauge-sub">ACCURACY</span>
              </div>
            </div>

            {/* Status Badges Matrix */}
            <div className="status-badges-matrix">
              <span className="status-badge badge-gold">✦ SOVEREIGN GOLD</span>
              <span className="status-badge badge-cyan">● NOMINAL TELEMETRY</span>
              <span className="status-badge badge-emerald">✓ VERIFIED GROUNDED</span>
              <span className="status-badge badge-crimson">! REDLINE AUDIT</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
