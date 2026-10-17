'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldCheck, ExternalLink, X, ChevronRight, FileCode, CheckCircle2 } from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';

interface WireRow {
  id: string;
  wireId: string;
  title: string;
  category: string;
  source: string;
  sourceUrl: string;
  status: 'VERIFIED GROUNDED' | 'INGESTED' | 'CANONICAL';
  timestamp: string;
  readingTimeMin: number;
  wordCount: number;
  verbatimQuote: string;
}

const SAMPLE_WIRES: WireRow[] = [
  {
    id: 'w-01',
    wireId: 'WIRE-US-9410',
    title: 'Rep. Torres Introduces Bill to Mandate Video Game Ownership Over Licensing',
    category: 'Technology & AI',
    source: 'Google News - Technology',
    sourceUrl: 'https://news.google.com',
    status: 'VERIFIED GROUNDED',
    timestamp: '14:20:12 UTC',
    readingTimeMin: 3,
    wordCount: 680,
    verbatimQuote: 'Consumers deserve permanent digital property ownership rights rather than revocable software licenses.',
  },
  {
    id: 'w-02',
    wireId: 'WIRE-AI-3821',
    title: 'NVIDIA RTX Spark Architecture Brings Dedicated LPU Local Execution to Edge',
    category: 'Technology & AI',
    source: 'Wccftech Wire',
    sourceUrl: 'https://news.google.com',
    status: 'VERIFIED GROUNDED',
    timestamp: '13:45:00 UTC',
    readingTimeMin: 2,
    wordCount: 520,
    verbatimQuote: 'Dedicated local tensor acceleration eliminates round-trip latency to centralized inference datacenters.',
  },
  {
    id: 'w-03',
    wireId: 'WIRE-SC-8812',
    title: 'Observatory Unveils Deep Infrared Spectrum of Outer Kuiper Belt Asteroid',
    category: 'Science & Space',
    source: 'Astrophysical Journal',
    sourceUrl: 'https://news.google.com',
    status: 'CANONICAL',
    timestamp: '11:15:30 UTC',
    readingTimeMin: 4,
    wordCount: 890,
    verbatimQuote: 'Methane and water-ice absorption bands confirm cryogenic preservation since early solar nebula formation.',
  },
  {
    id: 'w-04',
    wireId: 'WIRE-MK-4190',
    title: 'Treasury Yield Curve Inversion Normalizes as Short-Term Liquidity Rebalances',
    category: 'Markets & Policy',
    source: 'Financial Times Syndicate',
    sourceUrl: 'https://news.google.com',
    status: 'VERIFIED GROUNDED',
    timestamp: '09:30:18 UTC',
    readingTimeMin: 3,
    wordCount: 610,
    verbatimQuote: 'Overnight reverse-repo facility drawdown signals stabilization across interbank commercial paper markets.',
  },
  {
    id: 'w-05',
    wireId: 'WIRE-HZ-0922',
    title: 'Rediscovered Renaissance Cartography Reveals Early Arctic Sea Current Theories',
    category: 'Serendipity Horizon',
    source: 'Cartographic Heritage Review',
    sourceUrl: 'https://news.google.com',
    status: 'CANONICAL',
    timestamp: '08:00:45 UTC',
    readingTimeMin: 5,
    wordCount: 1120,
    verbatimQuote: 'Venetian parchment charts accurately predicted North Atlantic drift patterns four centuries ahead of modern bathymetry.',
  },
];

export function TelemetryDataTable() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [inspectingWire, setInspectingWire] = useState<WireRow | null>(null);

  const categories = ['ALL', 'Technology & AI', 'Science & Space', 'Markets & Policy', 'Serendipity Horizon'];

  const filtered = useMemo(() => {
    return SAMPLE_WIRES.filter((wire) => {
      const matchCat = selectedCategory === 'ALL' || wire.category === selectedCategory;
      const matchSearch =
        wire.title.toLowerCase().includes(search.toLowerCase()) ||
        wire.wireId.toLowerCase().includes(search.toLowerCase()) ||
        wire.source.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, selectedCategory]);

  const handleRowClick = (wire: WireRow) => {
    setInspectingWire(wire);
    audioHaptics.playClick(840, 0.04);
  };

  return (
    <section className="telemetry-table-section" id="telemetry-table-section">
      <div className="section-header-block">
        <div className="section-tag-row">
          <span className="watermark-number">04</span>
          <span className="section-badge-pill">HIGH-DENSITY DATA MATRIX // PRIMARY WIRE AUDIT</span>
        </div>
        <h2 className="section-title">Live Accredited Wires Stream</h2>
        <p className="section-desc">
          High-density client-side telemetry table with multi-tier status badges, instant search filtration, and deep inspection side-drawers.
        </p>
      </div>

      <div className="table-wrapper-card">
        {/* Controls Bar: Search + Category Filters */}
        <div className="table-controls-bar">
          <div className="table-search-box">
            <Search size={14} className="text-stone-400" />
            <input
              type="text"
              placeholder="Filter wires by title, ID, or accredited syndicate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="table-search-input"
            />
          </div>

          <div className="table-category-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  audioHaptics.playClick(780, 0.02);
                }}
                className={`table-chip ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dense Table */}
        <div className="table-responsive-container">
          <table className="dense-telemetry-table">
            <thead>
              <tr>
                <th>WIRE IDENTIFIER</th>
                <th>HEADLINE DISPATCH</th>
                <th>CATEGORY BEAT</th>
                <th>SOURCE SYNDICATE</th>
                <th>TIME</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row)}
                  className="table-interactive-row"
                  title="Click to inspect wire provenance"
                >
                  <td className="font-mono text-xs font-semibold text-stone-500">{row.wireId}</td>
                  <td className="font-serif font-semibold text-sm max-w-xs truncate">{row.title}</td>
                  <td className="text-xs text-stone-600 dark:text-stone-400">{row.category}</td>
                  <td className="text-xs font-medium">{row.source}</td>
                  <td className="font-mono text-xs text-stone-500">{row.timestamp}</td>
                  <td>
                    <span className={`status-pill ${row.status === 'VERIFIED GROUNDED' ? 'status-green' : 'status-gold'}`}>
                      <span className="pill-dot" />
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <button className="row-inspect-btn">
                      <span>Inspect</span>
                      <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wire Inspection Side-Drawer */}
      {inspectingWire && (
        <div className="drawer-backdrop" onClick={() => setInspectingWire(null)}>
          <div className="inspection-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="drawer-tag">{inspectingWire.wireId} • AUDIT LOG</span>
              </div>
              <button
                onClick={() => setInspectingWire(null)}
                className="drawer-close-btn"
                title="Dismiss Inspection Drawer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="drawer-body">
              <h3 className="drawer-title">{inspectingWire.title}</h3>

              <div className="drawer-meta-grid">
                <div className="drawer-meta-item">
                  <span className="meta-k">CATEGORY</span>
                  <span className="meta-v">{inspectingWire.category}</span>
                </div>
                <div className="drawer-meta-item">
                  <span className="meta-k">SOURCE ACCREDITATION</span>
                  <span className="meta-v">{inspectingWire.source}</span>
                </div>
                <div className="drawer-meta-item">
                  <span className="meta-k">READING VELOCITY</span>
                  <span className="meta-v">{inspectingWire.readingTimeMin} min ({inspectingWire.wordCount} words)</span>
                </div>
                <div className="drawer-meta-item">
                  <span className="meta-k">INGESTION STAMP</span>
                  <span className="meta-v font-mono">{inspectingWire.timestamp}</span>
                </div>
              </div>

              {/* Primary Source Quote Box */}
              <div className="drawer-quote-box">
                <span className="drawer-quote-title">100% VERBATIM PRIMARY SOURCE EVIDENCE</span>
                <blockquote className="drawer-quote-text">
                  “{inspectingWire.verbatimQuote}”
                </blockquote>
              </div>

              {/* Raw JSON Telemetry */}
              <div className="drawer-json-box">
                <div className="flex items-center gap-1.5 mb-2 font-mono text-[11px] text-stone-400">
                  <FileCode size={13} />
                  <span>RAW PAYLOAD TELEMETRY (JSON)</span>
                </div>
                <pre className="drawer-json-pre">
                  {JSON.stringify(inspectingWire, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
