'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, Send, X, Radio, Play, Pause } from 'lucide-react';
import { CanonicalEdition } from '@/lib/synthesis/schema';

interface AudioConciergeProps {
  edition: CanonicalEdition | null;
}

export function AudioConcierge({ edition }: AudioConciergeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    {
      sender: 'assistant',
      text: 'Good morning. I am your Editorial AI Concierge. I have indexed today\'s morning edition. You can ask me about any story, tap to listen to the audio briefing, or request specific context.',
      time: 'Live',
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Lock body scroll and pause Lenis while Concierge drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('drawer-open');
      if (typeof window !== 'undefined') {
        window.__lenis?.stop();
      }
    } else {
      document.body.classList.remove('drawer-open');
      if (typeof window !== 'undefined') {
        window.__lenis?.start();
      }
    }

    return () => {
      document.body.classList.remove('drawer-open');
      if (typeof window !== 'undefined') {
        window.__lenis?.start();
      }
    };
  }, [isOpen]);

  // Handle Text-to-Speech (Read Aloud)
  const toggleReadAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device/browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!edition) return;

    // Build editorial audio script
    const scriptParts: string[] = [
      `This is the Morning Dispatch for ${edition.mastheadTitle}.`,
      `Volume one, number ${edition.editionNumber}.`,
      `Lead story: ${edition.leadStory.headline}.`,
      `${edition.leadStory.narrativeText}`,
      `Key evidence from the report: ${edition.leadStory.sourceQuote}.`,
      `Why it matters: ${edition.leadStory.whyItMatters}.`,
    ];

    if (edition.sections && edition.sections.length > 0) {
      const topSection = edition.sections[0];
      scriptParts.push(`From the ${topSection.name} section:`);
      topSection.stories.slice(0, 2).forEach((s) => {
        scriptParts.push(`${s.headline}. ${s.narrativeText}`);
      });
    }

    if (edition.horizonStory) {
      scriptParts.push(`On The Horizon, beyond your standard topics: ${edition.horizonStory.headline}.`);
    }

    const fullText = scriptParts.join(' ');
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle Speech-to-Text Voice Query
  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSendMessage(transcript);
    };

    recognition.start();
  };

  // Send query to assistant endpoint
  const handleSendMessage = async (userText?: string) => {
    const textToSend = userText || query;
    if (!textToSend.trim() || isSubmitting) return;

    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textToSend }),
      });

      if (!res.ok) throw new Error('Assistant query failed');
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: data.answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I apologize, but I could not access the newsroom wire at this second. Please try asking again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Magnetic Acoustic Orb Launcher */}
      <div className="concierge-launcher-container">
        {/* Quick Read Audio Play Button */}
        <button
          onClick={toggleReadAloud}
          className={`concierge-audio-btn ${isPlayingAudio ? 'active-playing' : ''}`}
          title={isPlayingAudio ? 'Stop Reading Aloud' : 'Read Morning Paper Aloud'}
        >
          {isPlayingAudio ? (
            <>
              <Pause size={14} />
              <span>[ AUDIO BRIEFING · PLAYING ]</span>
            </>
          ) : (
            <>
              <Volume2 size={14} />
              <span>[ 60s AUDIO BRIEF ]</span>
            </>
          )}
        </button>

        {/* Primary Acoustic Capsule Launcher */}
        <button
          onClick={() => setIsOpen(true)}
          className="concierge-orb-btn"
          title="Open Voice AI Newsroom Desk"
        >
          {/* Animated Equalizer Bars */}
          <div className="concierge-equalizer">
            <span className="eq-bar eq-1" />
            <span className="eq-bar eq-2" />
            <span className="eq-bar eq-3" />
            <span className="eq-bar eq-4" />
          </div>

          <div className="concierge-orb-meta">
            <div className="concierge-orb-tag">
              <span className="orb-dot">●</span>
              <span>VOICE AI CONCIERGE</span>
            </div>
            <div className="concierge-orb-title">
              Ask Newsroom Desk
            </div>
          </div>
        </button>
      </div>

      {/* Slide-over Editorial AI Console Drawer */}
      {isOpen && (
        <div
          className="concierge-drawer-backdrop"
          data-lenis-prevent="true"
          onClick={() => setIsOpen(false)}
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className="concierge-drawer"
            data-lenis-prevent="true"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="concierge-drawer-header">
              <div className="concierge-drawer-title-group">
                <div className="concierge-live-dot" />
                <div>
                  <h3 className="concierge-drawer-title">
                    Editorial Newsroom Concierge
                  </h3>
                  <p className="concierge-drawer-subtitle">
                    [ Model: Groq LPU 120B · 100% Source Grounded ]
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="concierge-close-btn"
                title="Close drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Audio Voice Broadcast Bar */}
            <div className="concierge-broadcast-bar">
              <div className="broadcast-left">
                <Radio size={14} className="broadcast-icon" />
                <span>Audio News Wire</span>
              </div>
              <button
                onClick={toggleReadAloud}
                className={`broadcast-toggle-btn ${isPlayingAudio ? 'active-playing' : ''}`}
              >
                {isPlayingAudio ? <Pause size={12} /> : <Play size={12} />}
                <span>{isPlayingAudio ? 'Stop' : 'Listen to Brief'}</span>
              </button>
            </div>

            {/* Chat Transcript Area */}
            <div
              className="concierge-transcript"
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`concierge-msg-row ${m.sender === 'user' ? 'msg-user' : 'msg-assistant'}`}
                >
                  <div className="msg-header">
                    <span>{m.sender === 'user' ? 'Reader' : 'Editor in Chief'}</span>
                    <span>•</span>
                    <span>{m.time}</span>
                  </div>
                  <div className={`msg-bubble ${m.sender === 'user' ? 'bubble-user' : 'bubble-assistant'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isSubmitting && (
                <div className="concierge-thinking">
                  <span className="thinking-pulse" />
                  <span>Consulting newsroom wire...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Query Chips */}
            <div className="concierge-chips-row">
              <button
                onClick={() => handleSendMessage('Give me a 3-bullet summary of today\'s top news.')}
                className="concierge-chip"
              >
                Top 3 Bullets
              </button>
              <button
                onClick={() => handleSendMessage('What is today\'s Horizon serendipity story?')}
                className="concierge-chip"
              >
                The Horizon Story
              </button>
              <button
                onClick={() => handleSendMessage('Explain the lead story in simple terms.')}
                className="concierge-chip"
              >
                Lead Breakdown
              </button>
            </div>

            {/* Input Bar */}
            <div className="concierge-input-container">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="concierge-form"
              >
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`concierge-mic-btn ${isListening ? 'listening' : ''}`}
                  title={isListening ? 'Listening...' : 'Voice Input'}
                >
                  <Mic size={16} />
                </button>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask the newsroom editor anything..."
                  className="concierge-input-field"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !query.trim()}
                  className="concierge-send-btn"
                  title="Send message"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
