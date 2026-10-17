'use client';

import React, { useEffect, useState } from 'react';
import { Masthead } from '@/components/Masthead';
import { LeadStoryCard } from '@/components/LeadStoryCard';
import { StoryCard } from '@/components/StoryCard';
import { HorizonSection } from '@/components/HorizonSection';
import { PersonaModal } from '@/components/PersonaModal';
import { PreferencesModal } from '@/components/PreferencesModal';
import { ArchiveModal } from '@/components/ArchiveModal';
import { ChronoTelemetry } from '@/components/ChronoTelemetry';
import { AudioConcierge } from '@/components/AudioConcierge';
import { CanonicalEdition } from '@/lib/synthesis/schema';
import { Sparkles, Newspaper, AlertCircle } from 'lucide-react';

interface UserSessionState {
  id: string;
  name: string;
  role: string;
  personaKey?: string;
}

interface PreferencesState {
  topics: string[];
  readingDepth: 'quick_scan' | 'balanced' | 'deep_dive';
  serendipityMode: boolean;
}

export default function NewspaperPage() {
  const [edition, setEdition] = useState<CanonicalEdition | null>(null);
  const [sessionUser, setSessionUser] = useState<UserSessionState | null>(null);
  const [preferences, setPreferences] = useState<PreferencesState | null>(null);
  const [personas, setPersonas] = useState<any[]>([]);
  const [archiveEditions, setArchiveEditions] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal visibility states
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // Show transient toast
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. Initial Load: Fetch session & today's edition
  const loadInitialData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Fetch session
      const sessionRes = await fetch('/api/auth/session');
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        setSessionUser(sessionData.user);
        setPreferences(sessionData.preferences);
        setPersonas(sessionData.availablePersonas || []);
      }

      // Fetch today's edition (auto-generate if none exists)
      const editionRes = await fetch('/api/editions/today?autoGenerate=true');
      if (editionRes.ok) {
        const editionData = await editionRes.json();
        if (editionData.edition) {
          setEdition(editionData.edition);
        }
      }
    } catch (err) {
      console.error('Failed to load morning paper:', err);
      setErrorMsg('Failed to assemble morning edition. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // 2. Handle Persona Switching
  const handleSelectPersona = async (personaKey: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/auth/switch-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaKey }),
      });

      if (!res.ok) throw new Error('Failed to switch persona');
      const data = await res.json();
      setSessionUser(data.user);
      setIsPersonaOpen(false);
      showToast(`Switched reader to ${data.user.name}`);

      // Refresh paper for new persona
      await loadInitialData();
    } catch (err) {
      console.error(err);
      showToast('Error switching persona');
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Handle Preferences Save
  const handleSavePreferences = async (
    topics: string[],
    depth: 'quick_scan' | 'balanced' | 'deep_dive',
    serendipity: boolean
  ) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics,
          readingDepth: depth,
          serendipityMode: serendipity,
        }),
      });

      if (!res.ok) throw new Error('Failed to update preferences');
      const data = await res.json();
      setPreferences(data.preferences);
      showToast('Preferences updated! Generating fresh edition...');

      // Regenerate edition with updated preferences
      await handleGenerateFresh();
    } catch (err) {
      console.error(err);
      showToast('Failed to save preferences');
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Handle Feedback Signals (Adaptive Learning Loop)
  const handleFeedback = async (
    articleId: string,
    eventType: 'upvote' | 'skip' | 'save',
    topic?: string
  ) => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, eventType, topic }),
      });

      if (res.ok) {
        if (eventType === 'upvote') showToast(`Marked relevant: Tuned up ${topic || 'topic'}`);
        if (eventType === 'skip') showToast(`Skipped: Decreased weighting for ${topic || 'topic'}`);
        if (eventType === 'save') showToast('Saved article to briefcase');
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  // 5. Handle Fresh Edition Generation
  const handleGenerateFresh = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/editions/generate', { method: 'POST' });
      if (!res.ok) throw new Error('Edition generation failed');
      const data = await res.json();
      setEdition(data.edition);
      showToast(`Published Edition #${data.edition.editionNumber}!`);
    } catch (err) {
      console.error(err);
      showToast('Failed to synthesize fresh edition');
    } finally {
      setIsGenerating(false);
    }
  };

  // 6. Handle Archive Browsing
  const handleOpenArchive = async () => {
    setIsArchiveOpen(true);
    try {
      const res = await fetch('/api/editions/archive');
      if (res.ok) {
        const data = await res.json();
        setArchiveEditions(data.editions || []);
      }
    } catch (err) {
      console.error('Failed to load archive:', err);
    }
  };

  const handleSelectArchiveEdition = async (editionId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/editions/${editionId}`);
      if (!res.ok) throw new Error('Failed to load archived edition');
      const data = await res.json();
      setEdition(data.edition);
      setIsArchiveOpen(false);
      showToast(`Loaded Edition #${data.edition.editionNumber}`);
    } catch (err) {
      console.error(err);
      showToast('Error loading archived edition');
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Download PDF
  const handleDownloadPdf = () => {
    if (!edition) return;
    window.open(`/api/editions/${edition.id}/pdf`, '_blank');
  };

  return (
    <>
      {/* Top Chrono-Atmosphere & Live CRT Telemetry Rail */}
      <ChronoTelemetry
        engineName={edition?.providerUsed || 'Groq 120B'}
        generationMs={edition?.generationMs || 260}
        totalTokens={edition?.totalTokens || 1100}
      />

      {/* Subtle Film Scrim Texture Overlay */}
      <div className="film-grain-overlay" />

      <div className="newspaper-wrapper">
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--ink-border)',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '4px',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.82rem',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Sparkles size={16} color="var(--accent-gold)" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Masthead Header */}
      <Masthead
        title={edition?.mastheadTitle || `The Morning Dispatch for ${sessionUser?.name || 'Reader'}`}
        editionNumber={edition?.editionNumber || 1}
        editionDate={edition?.editionDate || new Date().toISOString()}
        currentPersonaName={sessionUser?.name}
        onOpenPersona={() => setIsPersonaOpen(true)}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
        onOpenArchive={handleOpenArchive}
        onDownloadPdf={handleDownloadPdf}
        onRegenerate={handleGenerateFresh}
        isGenerating={isGenerating}
        providerUsed={edition?.providerUsed}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
          <Newspaper size={48} className="spin" style={{ color: 'var(--ink-border)', marginBottom: '1rem' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>Assembling Your Morning Paper...</h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Discovering fresh RSS feeds, extracting content, and verifying evidence to primary sources.
          </p>
        </div>
      ) : errorMsg ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff5f5', border: '1px solid #fed7d7' }}>
          <AlertCircle size={32} color="#c53030" style={{ marginBottom: '0.5rem' }} />
          <h3>Unable to Load Morning Paper</h3>
          <p>{errorMsg}</p>
          <button onClick={handleGenerateFresh} className="btn-primary" style={{ marginTop: '1rem' }}>
            Try Generating Again
          </button>
        </div>
      ) : edition ? (
        <main>
          {/* Front Page Lead Story Hero */}
          <LeadStoryCard story={edition.leadStory} onFeedback={handleFeedback} />

          {/* Thematic Sections */}
          {edition.sections.map((section, idx) => (
            <section key={idx} className="newspaper-section">
              <div className="section-divider-bar">
                <h3 className="section-heading">{section.name.toUpperCase()}</h3>
                <span className="section-story-count">{section.stories.length} DISPATCHES</span>
              </div>

              <div className="stories-columns-grid">
                {section.stories.map((story) => (
                  <StoryCard key={story.id} story={story} onFeedback={handleFeedback} />
                ))}
              </div>
            </section>
          ))}

          {/* "The Horizon" Serendipity Discovery Section */}
          {edition.horizonStory && (
            <HorizonSection story={edition.horizonStory} onFeedback={handleFeedback} />
          )}
        </main>
      ) : null}

      {/* Modals */}
      <PersonaModal
        isOpen={isPersonaOpen}
        onClose={() => setIsPersonaOpen(false)}
        currentPersonaKey={sessionUser?.personaKey}
        personas={personas}
        onSelectPersona={handleSelectPersona}
        isSwitching={isGenerating}
      />

      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        currentTopics={preferences?.topics || ['Technology & AI', 'Global Markets']}
        currentReadingDepth={preferences?.readingDepth || 'balanced'}
        currentSerendipity={preferences?.serendipityMode ?? true}
        onSavePreferences={handleSavePreferences}
        isSaving={isGenerating}
      />

      <ArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        editions={archiveEditions}
        currentEditionId={edition?.id}
        onSelectEdition={handleSelectArchiveEdition}
        isLoading={isLoading}
      />

      {/* Floating Magnetic Voice AI Concierge Orb & Broadcast Console */}
      <AudioConcierge edition={edition} />
    </div>
  </>
  );
}
