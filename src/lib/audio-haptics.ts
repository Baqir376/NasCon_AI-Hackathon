/**
 * Procedural Web Audio API Haptics Synthesizer
 * Zero external audio files — 100% native in-browser acoustic synthesis.
 */

class AudioHapticsEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazy initialize on first interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted) {
      this.playChime(880, 0.08);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Crisp 820Hz micro-click with 35ms exponential decay on button hover
   */
  public playClick(frequency: number = 820, volume: number = 0.04) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      // Quick pitch drop for tactile feel
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, this.ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.036);
    } catch {
      // Graceful fallback if audio is disabled
    }
  }

  /**
   * Resonant acoustic bell chime on action executions, modals, or toasts
   */
  public playChime(freq: number = 660, duration: number = 0.35, volume: number = 0.08) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration + 0.01);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Play crystal harmonic frequency for the Solfeggio Resonator
   */
  public playHarmonic(freq: number, duration: number = 0.8) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Dual oscillator for rich resonance
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.5, now); // Perfect fifth harmonic

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch {
      // Graceful fallback
    }
  }
}

export const audioHaptics = new AudioHapticsEngine();

export function playAudioHaptic(type: 'click' | 'action' | 'bell' | 'chime' = 'click') {
  if (type === 'click') {
    audioHaptics.playClick(820, 0.04);
  } else if (type === 'action') {
    audioHaptics.playChime(660, 0.07);
  } else if (type === 'bell' || type === 'chime') {
    audioHaptics.playChime(880, 0.09);
  }
}
