'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, Sparkles } from 'lucide-react';
import { audioHaptics } from '@/lib/audio-haptics';

interface ShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShowreelModal({ isOpen, onClose }: ShowreelModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (isOpen) {
      audioHaptics.playChime(660, 0.4);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [isOpen]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  if (!isOpen) return null;

  // Determine active technique based on timecode
  let activeTechnique = '01 · Kinetic Hook';
  if (currentTime >= 2.0 && currentTime < 4.0) activeTechnique = '02 · Kinetic Typography & Velocity Shear';
  else if (currentTime >= 4.0 && currentTime < 6.0) activeTechnique = '03 · Geometric Morphing & Golden Ratio';
  else if (currentTime >= 6.0 && currentTime < 8.0) activeTechnique = '04 · 2D-to-3D Monolith Extrusion';
  else if (currentTime >= 8.0 && currentTime < 10.0) activeTechnique = '05 · Live Editorial Telemetry & Bézier Splines';
  else if (currentTime >= 10.0 && currentTime < 12.0) activeTechnique = '06 · Climactic Rotating Vitrine';
  else if (currentTime >= 12.0) activeTechnique = '07 · Monolithic End Title & Seamless Loop';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-white/15 bg-[#0a0b0e] shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d0f14]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <div>
              <h3 className="font-serif font-bold text-lg text-[#f7f5f0] tracking-wide">
                15-Second Motion Design Showreel
              </h3>
              <p className="text-xs font-mono text-[#8d99ae]">
                Concept: &ldquo;Ink becomes type becomes data becomes architecture&rdquo; · 120 BPM · 60 FPS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] text-xs font-mono font-medium">
              {activeTechnique}
            </span>
            <button
              onClick={() => {
                audioHaptics.playClick(600, 0.02);
                onClose();
              }}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Theater"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center group overflow-hidden">
          <video
            ref={videoRef}
            src="/showreel/morning_paper_showreel.mp4"
            className="w-full h-full object-contain cursor-pointer"
            loop
            playsInline
            autoPlay
            onTimeUpdate={handleTimeUpdate}
            onClick={togglePlay}
          />

          {/* Center Play Overlay when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
            >
              <Play size={32} className="ml-1 fill-white" />
            </button>
          )}

          {/* Telemetry Corner Badges */}
          <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1 font-mono text-[11px] text-white/70 drop-shadow">
            <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 backdrop-blur-sm">
              TC: {currentTime.toFixed(2)}s / 15.00s
            </span>
          </div>
        </div>

        {/* Controls & Architecture Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 border-t border-white/10 bg-[#0d0f14]/90 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              onClick={restartVideo}
              className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Replay from Beginning"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={toggleMute}
              className="p-2 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            {/* Timecode scrubber bar */}
            <div className="w-32 sm:w-48 h-1.5 bg-white/15 rounded-full overflow-hidden ml-2">
              <div
                className="h-full bg-red-500 transition-all duration-75"
                style={{ width: `${(currentTime / 15.0) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-[#8d99ae]">
            <span className="hidden md:inline">Voiceover: Neural SAPI</span>
            <span className="hidden sm:inline">·</span>
            <span>Web Audio 120 BPM</span>
            <span>·</span>
            <a
              href="/showreel/morning_paper_showreel.mp4"
              download="morning_paper_showreel.mp4"
              className="text-[#d4af37] hover:underline"
            >
              Download MP4
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
