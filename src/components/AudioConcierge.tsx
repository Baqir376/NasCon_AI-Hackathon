'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Mic,
  Send,
  X,
  Radio,
  Play,
  Pause,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  HelpCircle,
  BookOpen,
  Lightbulb,
  Compass,
} from 'lucide-react';
import { CanonicalEdition } from '@/lib/synthesis/schema';
import { playAudioHaptic } from '@/lib/audio-haptics';

interface AudioConciergeProps {
  edition: CanonicalEdition | null;
}

export function AudioConcierge({ edition }: AudioConciergeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [query, setQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState<number | null>(null);

  const initialGreeting = {
    sender: 'assistant' as const,
    text: 'Good morning. I am your Daily AI Newsroom Concierge. I have indexed today\'s full morning edition across all beats and wires. Ask me any question, request a plain-language explanation, or listen to audio summaries.',
    time: 'Live',
  };

  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([
    initialGreeting,
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSubmitting]);

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

  // Handle Full Edition Audio Briefing (Read Aloud)
  const toggleReadAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device/browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setActiveSpeechIndex(null);
      playAudioHaptic('click');
      return;
    }

    if (!edition) return;

    playAudioHaptic('action');

    // Build editorial audio script
    const scriptParts: string[] = [
      `This is the Morning Dispatch for ${edition.mastheadTitle}.`,
      `Volume one, number ${edition.editionNumber}.`,
      `Lead story: ${edition.leadStory.headline}.`,
      `${edition.leadStory.narrativeText}`,
      `Key evidence from the primary wire report: ${edition.leadStory.sourceQuote}.`,
      `Why it matters to you: ${edition.leadStory.whyItMatters}.`,
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
    utterance.pitch = 0.98;

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setActiveSpeechIndex(null);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setActiveSpeechIndex(null);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  // Speak single assistant bubble
  const handleSpeakMessage = (text: string, idx: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (activeSpeechIndex === idx) {
      window.speechSynthesis.cancel();
      setActiveSpeechIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlayingAudio(false);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 1.0;
    utterance.onend = () => setActiveSpeechIndex(null);
    utterance.onerror = () => setActiveSpeechIndex(null);

    window.speechSynthesis.speak(utterance);
    setActiveSpeechIndex(idx);
    playAudioHaptic('click');
  };

  // Copy assistant response
  const handleCopyMessage = (text: string, idx: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(idx);
      playAudioHaptic('click');
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  // Reset chat conversation
  const handleResetConversation = () => {
    playAudioHaptic('click');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setActiveSpeechIndex(null);
    setMessages([initialGreeting]);
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
      alert('Speech recognition is not supported in this browser. Please type your query in the field.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      playAudioHaptic('click');
      return;
    }

    playAudioHaptic('action');
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

    playAudioHaptic('action');

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
      playAudioHaptic('chime');
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I apologize, but I could not access the newsroom wire at this second. Please try asking again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      playAudioHaptic('click');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Concierge Launcher Pill */}
      <div className="concierge-launcher-container">
        {/* Quick Read Audio Play Button */}
        <button
          onClick={toggleReadAloud}
          className={`concierge-audio-btn ${isPlayingAudio ? 'active-playing' : ''}`}
          title={isPlayingAudio ? 'Pause Audio Briefing' : 'Listen to 60-Second Audio Briefing'}
        >
          {isPlayingAudio ? (
            <>
              <Pause size={14} className="text-amber-500 animate-pulse" />
              <span>PAUSE AUDIO BRIEF</span>
            </>
          ) : (
            <>
              <Volume2 size={14} className="text-amber-500" />
              <span>60s AUDIO BRIEF</span>
            </>
          )}
        </button>

        {/* Primary Acoustic Capsule Launcher */}
        <button
          onClick={() => {
            setIsOpen(true);
            playAudioHaptic('action');
          }}
          className="concierge-orb-btn"
          title="Open Daily AI Concierge Chat Desk"
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
              <span>DAILY AI ASSISTANT</span>
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
          onClick={() => {
            setIsOpen(false);
            playAudioHaptic('click');
          }}
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
                    Newsroom AI Assistant
                  </h3>
                  <p className="concierge-drawer-subtitle">
                    100% Fact-Grounded · Verified Against Primary Wires
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Reset Conversation Button */}
                <button
                  onClick={handleResetConversation}
                  className="concierge-tool-btn"
                  title="Clear conversation history"
                >
                  <RotateCcw size={13} />
                  <span className="hidden sm:inline">Reset</span>
                </button>

                {/* Close Drawer Button */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    playAudioHaptic('click');
                  }}
                  className="concierge-close-btn"
                  title="Close Assistant Drawer (Esc)"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Audio Voice Broadcast Bar */}
            <div className="concierge-broadcast-bar">
              <div className="broadcast-left">
                <Radio size={14} className="broadcast-icon text-amber-500" />
                <div>
                  <span className="font-semibold block text-xs">Audio News Briefing</span>
                  <span className="text-[10px] text-stone-400">Narrated summary of today&apos;s morning edition</span>
                </div>
              </div>
              <button
                onClick={toggleReadAloud}
                className={`broadcast-toggle-btn ${isPlayingAudio ? 'active-playing' : ''}`}
                title={isPlayingAudio ? 'Pause Audio Briefing' : 'Listen to 60-Second Audio Briefing'}
              >
                {isPlayingAudio ? <Pause size={12} /> : <Play size={12} />}
                <span>{isPlayingAudio ? 'Pause' : 'Play Audio'}</span>
              </button>
            </div>

            {/* Chat Transcript Area */}
            <div
              className="concierge-transcript"
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
            >
              {/* Helpful Friendly Explainer Card */}
              <div className="concierge-guide-card">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-amber-500" />
                  <span className="font-serif font-bold text-xs">How Can I Help You Today?</span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-2">
                  I can summarize complex stories, explain unfamiliar concepts simply, or search for key statistics and findings in today&apos;s paper.
                </p>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                  💡 Tip: Click any suggested question below or type your own question into the bar.
                </div>
              </div>

              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`concierge-msg-row ${m.sender === 'user' ? 'msg-user' : 'msg-assistant'}`}
                >
                  <div className="msg-header">
                    <span>{m.sender === 'user' ? 'You' : 'Editor in Chief'}</span>
                    <span>•</span>
                    <span>{m.time}</span>
                  </div>
                  <div className={`msg-bubble ${m.sender === 'user' ? 'bubble-user' : 'bubble-assistant'}`}>
                    {m.text}
                  </div>

                  {/* Actions for Assistant Message */}
                  {m.sender === 'assistant' && (
                    <div className="assistant-bubble-actions">
                      <button
                        onClick={() => handleCopyMessage(m.text, idx)}
                        className="bubble-action-btn"
                        title="Copy answer to clipboard"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check size={11} className="text-emerald-500" />
                            <span className="text-emerald-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleSpeakMessage(m.text, idx)}
                        className={`bubble-action-btn ${activeSpeechIndex === idx ? 'text-amber-500' : ''}`}
                        title={activeSpeechIndex === idx ? 'Stop voice reading' : 'Listen to this response narrated'}
                      >
                        {activeSpeechIndex === idx ? (
                          <>
                            <VolumeX size={11} className="text-amber-500" />
                            <span className="text-amber-500">Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={11} />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {isSubmitting && (
                <div className="concierge-thinking">
                  <span className="thinking-pulse" />
                  <span>Synthesizing fact-grounded answer from newsroom wires...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Query Chips */}
            <div className="concierge-chips-section">
              <span className="chips-label">SUGGESTED QUESTIONS:</span>
              <div className="concierge-chips-row">
                <button
                  onClick={() => handleSendMessage('Give me a 3-bullet summary of today\'s top news dispatches.')}
                  className="concierge-chip"
                  title="Get quick executive summary"
                >
                  <BookOpen size={11} className="inline mr-1 text-amber-500" />
                  Top 3 Dispatches
                </button>
                <button
                  onClick={() => handleSendMessage('Explain the lead front-page story in simple terms without technical jargon.')}
                  className="concierge-chip"
                  title="Plain-language explanation"
                >
                  <Lightbulb size={11} className="inline mr-1 text-emerald-500" />
                  Explain Simply
                </button>
                <button
                  onClick={() => handleSendMessage('What is today\'s Horizon serendipity story and why is it interesting?')}
                  className="concierge-chip"
                  title="Explore the unexpected horizon discovery"
                >
                  <Compass size={11} className="inline mr-1 text-indigo-500" />
                  The Horizon Story
                </button>
                <button
                  onClick={() => handleSendMessage('What are the key verified data points and statistics reported today?')}
                  className="concierge-chip"
                  title="Extract key figures"
                >
                  <HelpCircle size={11} className="inline mr-1 text-cyan-500" />
                  Key Statistics
                </button>
              </div>
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
                  title={isListening ? 'Listening to your voice... Speak now' : 'Dictate question with microphone'}
                >
                  <Mic size={15} />
                  {isListening && <span className="mic-pulse" />}
                </button>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask any question about today's morning paper..."
                  className="concierge-input-field"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !query.trim()}
                  className="concierge-send-btn"
                  title="Send question (Enter)"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

