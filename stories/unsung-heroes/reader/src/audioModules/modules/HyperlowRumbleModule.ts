/**
 * Hyperlow Rumble Module - Rung 9
 * 
 * Successor: Beyond comprehension
 * 
 * Creates a deep sub-bass rumble with glitchy microsound elements, representing
 * something beyond organic or silicon. Combines very low frequency oscillation
 * with bitcrushed glitch events.
 */

import { BaseAudioModule } from '../BaseAudioModule';
import type { AudioModuleConfig, HyperlowRumbleConfig } from '../AudioModuleTypes';

export class HyperlowRumbleModule extends BaseAudioModule {
  // Bass layer
  private bassOscillator: OscillatorNode | null = null;
  private bassGain: GainNode | null = null;
  private bassModLFO: OscillatorNode | null = null;
  private bassModGain: GainNode | null = null;
  
  // Glitch layer
  private glitchTimer: number | null = null;
  private activeGlitchCleanups: number[] = [];

  protected getDefaultConfig(): AudioModuleConfig {
    return {
      masterGain: 0.20,
      panWidth: 0.5,
      lowCutoff: 30,
      highCutoff: 2500,
      density: 0.35,
      complexity: 0.7,
      bassFreqMin: 35,
      bassFreqMax: 55,
      bassModRate: 0.03,
      bassGain: 0.25,
      glitchDensity: 0.3,
      glitchIntensity: 0.4,
      glitchDuration: 0.08,
      bitDepthMin: 8,
      bitDepthMax: 14,
      bassGlitchBalance: 0.4,
    };
  }

  protected onInit(): void {
    if (!this.audioContext) return;

    const config = this.config as HyperlowRumbleConfig;

    // Create bass oscillator (sub-bass)
    this.bassOscillator = this.audioContext.createOscillator();
    this.bassOscillator.type = 'sine';
    
    // Random frequency in very low range
    const bassFreq = config.bassFreqMin + 
      Math.random() * (config.bassFreqMax - config.bassFreqMin);
    this.bassOscillator.frequency.value = bassFreq;

    // Bass gain
    this.bassGain = this.audioContext.createGain();
    this.bassGain.gain.value = config.bassGain;

    // Bass modulation LFO (very slow frequency drift)
    this.bassModLFO = this.audioContext.createOscillator();
    this.bassModLFO.type = 'sine';
    this.bassModLFO.frequency.value = config.bassModRate;

    this.bassModGain = this.audioContext.createGain();
    // Modulation depth in Hz
    this.bassModGain.gain.value = (config.bassFreqMax - config.bassFreqMin) * 0.5;

    // Connect bass chain: bassModLFO -> bassModGain -> bassOscillator.frequency
    // bassOscillator -> bassGain -> inputNode
    this.bassModLFO.connect(this.bassModGain);
    this.bassModGain.connect(this.bassOscillator.frequency);
    
    this.bassOscillator.connect(this.bassGain);
    const inputNode = this.getInputNode();
    if (inputNode) {
      this.bassGain.connect(inputNode);
    }

    this.metrics.activeNodes = 4; // Bass layer nodes
  }

  protected onStart(): void {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Start bass layer
    if (this.bassOscillator && this.bassModLFO) {
      this.bassOscillator.start(now);
      this.bassModLFO.start(now);
    }

    // Start glitch layer
    this.scheduleNextGlitch();
  }

  protected onStop(): void {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Stop glitch scheduling
    if (this.glitchTimer !== null) {
      clearTimeout(this.glitchTimer);
      this.glitchTimer = null;
    }

    // Clean up active glitches
    this.activeGlitchCleanups.forEach(timer => clearTimeout(timer));
    this.activeGlitchCleanups = [];

    // Stop bass layer
    if (this.bassOscillator) {
      try {
        this.bassOscillator.stop(now);
      } catch {
        // Ignore if already stopped
      }
    }

    if (this.bassModLFO) {
      try {
        this.bassModLFO.stop(now);
      } catch {
        // Ignore if already stopped
      }
    }
  }

  protected onDestroy(): void {
    // Disconnect bass layer
    if (this.bassOscillator) {
      this.bassOscillator.disconnect();
      this.bassOscillator = null;
    }

    if (this.bassGain) {
      this.bassGain.disconnect();
      this.bassGain = null;
    }

    if (this.bassModLFO) {
      this.bassModLFO.disconnect();
      this.bassModLFO = null;
    }

    if (this.bassModGain) {
      this.bassModGain.disconnect();
      this.bassModGain = null;
    }

    this.metrics.activeNodes = 0;
  }

  protected onConfigUpdate(config: Partial<AudioModuleConfig>): void {
    if (!this.audioContext) return;

    const fullConfig = this.config as HyperlowRumbleConfig;
    const now = this.audioContext.currentTime;

    // Update bass gain
    if (config.bassGain !== undefined && this.bassGain) {
      this.bassGain.gain.setTargetAtTime(fullConfig.bassGain, now, 0.1);
    }

    // Update bass modulation depth
    if (config.bassFreqMin !== undefined || config.bassFreqMax !== undefined) {
      if (this.bassModGain) {
        const depth = (fullConfig.bassFreqMax - fullConfig.bassFreqMin) * 0.5;
        this.bassModGain.gain.setTargetAtTime(depth, now, 0.1);
      }
    }

    // Reschedule glitches if density changed
    if (config.glitchDensity !== undefined && this.glitchTimer !== null) {
      clearTimeout(this.glitchTimer);
      this.scheduleNextGlitch();
    }
  }

  /**
   * Schedule next glitch event
   */
  private scheduleNextGlitch(): void {
    if (this.state !== 'running') return;

    const config = this.config as HyperlowRumbleConfig;
    
    // Calculate interval based on glitch density
    const baseInterval = 1000 / (config.glitchDensity + 0.01);
    const interval = baseInterval * (0.5 + Math.random() * 1.5);

    this.glitchTimer = window.setTimeout(() => {
      if (this.state === 'running') {
        this.triggerGlitch();
        this.scheduleNextGlitch();
      }
    }, Math.max(100, interval));
  }

  /**
   * Trigger a glitch event
   */
  private triggerGlitch(): void {
    if (!this.audioContext) return;

    const config = this.config as HyperlowRumbleConfig;
    const now = this.audioContext.currentTime;

    // Create glitch noise
    const noiseBuffer = this.createGlitchNoise();
    const source = this.audioContext.createBufferSource();
    source.buffer = noiseBuffer;
    source.playbackRate.value = 0.3 + Math.random() * 2.0;

    // Envelope
    const envelope = this.audioContext.createGain();
    envelope.gain.value = 0;

    // Bitcrusher
    const bitDepth = config.bitDepthMin + 
      Math.random() * (config.bitDepthMax - config.bitDepthMin);
    const waveshaper = this.audioContext.createWaveShaper();
    const curve = this.createBitcrushCurve(bitDepth);
    // @ts-expect-error - TypeScript strict typing issue with Float32Array and ArrayBuffer
    waveshaper.curve = curve;

    // Random pan
    const panner = this.audioContext.createStereoPanner();
    panner.pan.value = (Math.random() - 0.5) * config.panWidth;

    // Connect: source -> waveshaper -> envelope -> panner -> inputNode
    source.connect(waveshaper);
    waveshaper.connect(envelope);
    envelope.connect(panner);
    
    const inputNode = this.getInputNode();
    if (inputNode) {
      panner.connect(inputNode);
    }

    // Envelope
    const duration = config.glitchDuration;
    const peakGain = config.glitchIntensity * config.bassGlitchBalance;

    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(peakGain, now + duration * 0.3);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Start and stop
    source.start(now);
    source.stop(now + duration);

    // Cleanup
    const cleanupTimer = window.setTimeout(() => {
      try {
        source.disconnect();
        waveshaper.disconnect();
        envelope.disconnect();
        panner.disconnect();
      } catch {
        // Ignore if already disconnected
      }

      const index = this.activeGlitchCleanups.indexOf(cleanupTimer);
      if (index > -1) {
        this.activeGlitchCleanups.splice(index, 1);
      }
    }, (duration + 0.1) * 1000);

    this.activeGlitchCleanups.push(cleanupTimer);
    this.metrics.activeNodes = 4 + this.activeGlitchCleanups.length * 4;
  }

  /**
   * Create glitch noise buffer
   */
  private createGlitchNoise(): AudioBuffer {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    const config = this.config as HyperlowRumbleConfig;
    const bufferSize = Math.floor(this.audioContext.sampleRate * config.glitchDuration);
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    // Create glitchy noise with random patterns
    for (let i = 0; i < bufferSize; i++) {
      // Mix of white noise and random digital patterns
      const noise = Math.random() * 2 - 1;
      const pattern = Math.sin(i * 0.1) * (Math.random() > 0.7 ? 1 : 0);
      output[i] = noise * 0.7 + pattern * 0.3;
    }

    return buffer;
  }

  /**
   * Create bitcrush waveshaper curve
   */
  private createBitcrushCurve(bitDepth: number): Float32Array {
    const steps = Math.pow(2, Math.max(4, Math.floor(bitDepth)));
    const samples = 65536;
    const curve = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2 / samples) - 1;
      const quantized = Math.round(x * steps) / steps;
      curve[i] = Math.max(-1, Math.min(1, quantized));
    }

    return curve;
  }
}
