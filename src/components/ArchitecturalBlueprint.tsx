'use client';

import React, { useState } from 'react';
import { Radio, ShieldCheck, Cpu, Database, FileText, CheckCircle2 } from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';

interface HotspotDetail {
  id: string;
  stageNumber: string;
  title: string;
  coordinates: string;
  telemetry: string;
  description: string;
  latencyMs: number;
  specs: string[];
}

const BLUEPRINT_STAGES: HotspotDetail[] = [
  {
    id: 'stage-ingestion',
    stageNumber: '01',
    title: 'Multi-Source RSS Wire Harvester',
    coordinates: 'NODE [X: 120, Y: 140]',
    telemetry: 'THROUGHPUT: 12.4 req/s',
    latencyMs: 140,
    description: 'Concurrent asynchronous ingestion across Google News Technology and Science accredited syndicates.',
    specs: ['RSS-Parser streaming buffer', 'Exponential backoff with jitter', 'Raw XML payload normalization'],
  },
  {
    id: 'stage-dedup',
    stageNumber: '02',
    title: 'Mozilla Readability & Shingle Deduplicator',
    coordinates: 'NODE [X: 240, Y: 140]',
    telemetry: 'COLLISION INDEX: 0.02%',
    latencyMs: 65,
    description: 'DOM sanitization, clutter removal, and 3-gram title shingle jaccard similarity clustering.',
    specs: ['Mozilla Readability DOM extractor', 'Jaccard title token overlap >= 0.6', 'Canonical URL hashing'],
  },
  {
    id: 'stage-synthesis',
    stageNumber: '03',
    title: 'Groq LPU LLM Synthesis Engine',
    coordinates: 'NODE [X: 360, Y: 140]',
    telemetry: 'INFERENCE: 480 tok/s',
    latencyMs: 820,
    description: 'High-throughput LLM section narrative generation adhering to strict JSON schema and persona biases.',
    specs: ['Groq LPU hardware acceleration', 'Persona curatorial steering', 'Deterministic extractive fallback'],
  },
  {
    id: 'stage-verifier',
    stageNumber: '04',
    title: 'Verbatim Source Attestation Verifier',
    coordinates: 'NODE [X: 480, Y: 140]',
    telemetry: 'GROUNDING: 100% VERBATIM',
    latencyMs: 18,
    description: 'Strict programmatic substring verification ensuring zero ungrounded hallucinations in the final dispatch.',
    specs: ['Exact substring matching in raw body', 'Flagging and sentence rejection', 'Hallucination defense gate'],
  },
  {
    id: 'stage-lithograph',
    stageNumber: '05',
    title: 'Cold-Press Broadsheet Lithograph Engine',
    coordinates: 'NODE [X: 600, Y: 140]',
    telemetry: 'PARITY: 100% WEB MATCH',
    latencyMs: 450,
    description: 'Broadsheet print layout engine rendering responsive web reader and downloadable PDF archive.',
    specs: ['Playwright headless print renderer', 'A4 / Broadsheet page geometry', 'Deckle border vector styles'],
  },
];

export function ArchitecturalBlueprint() {
  const [activeStage, setActiveStage] = useState<HotspotDetail>(BLUEPRINT_STAGES[2]);

  const selectStage = (stage: HotspotDetail) => {
    setActiveStage(stage);
    audioHaptics.playChime(700 + parseInt(stage.stageNumber) * 40, 0.2, 0.06);
  };

  return (
    <section className="blueprint-section" id="blueprint-section">
      <div className="section-header-block">
        <div className="section-tag-row">
          <span className="watermark-number">03</span>
          <span className="section-badge-pill">SYSTEM ARCHITECTURE // INTERACTIVE SCHEMATIC</span>
        </div>
        <h2 className="section-title">Autonomous Newsroom Pipeline Schematic</h2>
        <p className="section-desc">
          Click any pulsing node on the vector blueprint to inspect localized latency budgets, data models, and verification constraints.
        </p>
      </div>

      <div className="blueprint-viewport-card">
        {/* SVG Pipeline Schematic */}
        <div className="blueprint-svg-container">
          <svg viewBox="0 0 720 280" className="blueprint-svg">
            <defs>
              <pattern id="blueprintGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border-light)" strokeWidth="0.5" opacity="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#blueprintGrid)" />

            {/* Connecting Bus Line */}
            <path
              d="M 120 140 L 600 140"
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="pipeline-bus-line"
            />

            {/* Stage Hotspot Pins */}
            {BLUEPRINT_STAGES.map((stage, i) => {
              const cx = 120 + i * 120;
              const cy = 140;
              const isActive = activeStage.id === stage.id;
              return (
                <g
                  key={stage.id}
                  onClick={() => selectStage(stage)}
                  className="blueprint-node-group cursor-pointer"
                >
                  {/* Outer Pulsing Beacon */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? 24 : 18}
                    fill={isActive ? 'rgba(229, 57, 53, 0.2)' : 'rgba(197, 155, 39, 0.12)'}
                    className="pulse-circle"
                  />
                  {/* Core Node */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? 12 : 9}
                    fill={isActive ? 'var(--accent-primary)' : 'var(--bg-surface)'}
                    stroke="var(--accent-primary)"
                    strokeWidth="2.5"
                  />
                  {/* Stage Label Number */}
                  <text
                    x={cx}
                    y={cy + 4}
                    textAnchor="middle"
                    fill={isActive ? '#ffffff' : 'var(--text-main)'}
                    fontSize="10"
                    fontFamily="var(--font-sans)"
                    fontWeight="bold"
                  >
                    {stage.stageNumber}
                  </text>
                  <text
                    x={cx}
                    y={cy - 26}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize="9"
                    fontFamily="var(--font-sans)"
                    fontWeight="600"
                    letterSpacing="0.05em"
                  >
                    STAGE {stage.stageNumber}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Inspection Drawer */}
        <div className="blueprint-inspection-card">
          <div className="inspection-top-row">
            <div className="inspection-title-group">
              <span className="inspection-stage-badge">STAGE {activeStage.stageNumber} • TELEMETRY</span>
              <h3 className="inspection-title">{activeStage.title}</h3>
            </div>
            <div className="inspection-metrics">
              <span className="telemetry-chip">{activeStage.telemetry}</span>
              <span className="latency-chip">LATENCY: {activeStage.latencyMs}ms</span>
            </div>
          </div>

          <p className="inspection-desc">{activeStage.description}</p>

          <div className="inspection-specs-grid">
            {activeStage.specs.map((spec, idx) => (
              <div key={idx} className="spec-item">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>{spec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
