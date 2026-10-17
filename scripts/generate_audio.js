const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function generateSoundtrack() {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();

  // Run OfflineAudioContext inside the browser
  const wavBase64 = await page.evaluate(async () => {
    const sampleRate = 44100;
    const duration = 15.0; // exactly 15 seconds
    const totalSamples = Math.floor(sampleRate * duration);
    const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

    const bpm = 120;
    const beatSec = 60 / bpm; // 0.5s

    // Master bus
    const masterGain = offlineCtx.createGain();
    masterGain.gain.setValueAtTime(0.85, 0);
    masterGain.connect(offlineCtx.destination);

    // 1. Kick on every beat (30 beats)
    for (let beat = 0; beat < 30; beat++) {
      const t = beat * beatSec;
      
      // Kick oscillator
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(38, t + 0.12);

      gain.gain.setValueAtTime(1.0, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(t);
      osc.stop(t + 0.25);

      // Snappy kick click transient
      const click = offlineCtx.createOscillator();
      const clickGain = offlineCtx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(600, t);
      click.frequency.exponentialRampToValueAtTime(80, t + 0.02);
      clickGain.gain.setValueAtTime(0.4, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      click.connect(clickGain);
      clickGain.connect(masterGain);
      click.start(t);
      click.stop(t + 0.03);
    }

    // 2. Scene hit on each scene change (every 2.0s: t = 0, 2, 4, 6, 8, 10, 12)
    const sceneTimes = [0.0, 2.0, 4.0, 6.0, 8.0, 10.0, 12.0];
    const hitFrequencies = [220, 277.18, 329.63, 440, 554.37, 659.25, 880];

    sceneTimes.forEach((t, i) => {
      [hitFrequencies[i % hitFrequencies.length], hitFrequencies[i % hitFrequencies.length] * 1.5].forEach(freq => {
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        const filter = offlineCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, t);
        filter.frequency.exponentialRampToValueAtTime(200, t + 0.6);

        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(t);
        osc.stop(t + 0.75);
      });
    });

    // 3. Riser into the last full bar (t = 8.5s to 12.0s)
    const riserStart = 8.5;
    const riserEnd = 12.0;
    const riserDuration = riserEnd - riserStart;
    
    const riserOsc = offlineCtx.createOscillator();
    const riserGain = offlineCtx.createGain();
    riserOsc.type = 'sawtooth';
    riserOsc.frequency.setValueAtTime(85, riserStart);
    riserOsc.frequency.exponentialRampToValueAtTime(920, riserEnd);

    riserGain.gain.setValueAtTime(0.001, riserStart);
    riserGain.gain.exponentialRampToValueAtTime(0.65, riserEnd - 0.05);
    riserGain.gain.setValueAtTime(0, riserEnd);

    const riserFilter = offlineCtx.createBiquadFilter();
    riserFilter.type = 'bandpass';
    riserFilter.frequency.setValueAtTime(200, riserStart);
    riserFilter.frequency.exponentialRampToValueAtTime(3200, riserEnd);
    riserFilter.Q.setValueAtTime(4.0, riserStart);

    riserOsc.connect(riserFilter);
    riserFilter.connect(riserGain);
    riserGain.connect(masterGain);

    riserOsc.start(riserStart);
    riserOsc.stop(riserEnd);

    // Render buffer
    const renderedBuffer = await offlineCtx.startRendering();

    // Convert AudioBuffer to WAV ArrayBuffer
    function audioBufferToWav(buffer) {
      const numChannels = buffer.numberOfChannels;
      const sampleRate = buffer.sampleRate;
      const format = 1; // PCM
      const bitDepth = 16;

      const bytesPerSample = bitDepth / 8;
      const blockAlign = numChannels * bytesPerSample;

      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(numChannels > 1 ? 1 : 0);
      const numSamples = left.length;

      const dataByteLength = numSamples * blockAlign;
      const arrayBuffer = new ArrayBuffer(44 + dataByteLength);
      const view = new DataView(arrayBuffer);

      function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      }

      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + dataByteLength, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, format, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * blockAlign, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitDepth, true);
      writeString(view, 36, 'data');
      view.setUint32(40, dataByteLength, true);

      let offset = 44;
      for (let i = 0; i < numSamples; i++) {
        let sLeft = Math.max(-1, Math.min(1, left[i]));
        let sRight = Math.max(-1, Math.min(1, right[i]));
        view.setInt16(offset, sLeft < 0 ? sLeft * 0x8000 : sLeft * 0x7FFF, true);
        view.setInt16(offset + 2, sRight < 0 ? sRight * 0x8000 : sRight * 0x7FFF, true);
        offset += 4;
      }

      return arrayBuffer;
    }

    const wavBuffer = audioBufferToWav(renderedBuffer);
    const bytes = new Uint8Array(wavBuffer);
    let binary = '';
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  });

  const buffer = Buffer.from(wavBase64, 'base64');
  fs.writeFileSync(path.resolve(__dirname, 'soundtrack.wav'), buffer);
  console.log(`Procedural soundtrack rendered: ${buffer.length} bytes`);
  await browser.close();
}

generateSoundtrack().catch(console.error);
