/**
 * Microsound Module - Rung 4
 * 
 * Early cells: Metabolic efficiency
 * 
 * Creates light microsound crackles with bitcrushing effects representing
 * discrete state transitions in early cellular automata. Uses sparse, short
 * glitchy sounds with random panning.
 */

import { BaseAudioModule } from '../BaseAudioModule';
import type { AudioModuleConfig, MicrosoundConfig } from '../AudioModuleTypes';

export class MicrosoundModule extends BaseAudioModule {
  private crackleTimer: number | null = null;
  private activeCleanups: number[] = [];

  protected getDefaultConfig(): AudioModuleConfig {
    return {
      masterGain: 0.14,
      panWidth: 0.5,
      lowCutoff: 200,
      highCutoff: 2000,
      density: 0.3,
      complexity: 0.4,
      crackleRate: 0.5,
      crackleIntensity: 0.3,
      crackleDuration: 0.05,
      bitDepth: 12,
      bitDepthVariation: 3,
      sampleRateReduction: 4,
      filterFreq: 300,
      panRandomization: 0.7,
    };
  }

  protected onInit(): void {
    // Microsound synthesis is event-based
  }

  protected onStart(): void {
    this.scheduleNextCrackle();
  }

  protected onStop(): void {
    if (this.crackleTimer !== null) {
      clearTimeout(this.crackleTimer);
      this.crackleTimer = null;
    }

    this.activeCleanups.forEach(timer => clearTimeout(timer));
    this.activeCleanups = [];
  }

  protected onDestroy(): void {
    this.onStop();
    this.metrics.activeNodes = 0;
  }

  protected onConfigUpdate(config: Partial<AudioModuleConfig>): void {
    // Config updates affect future events
    if (config.crackleRate !== undefined && this.crackleTimer !== null) {
      clearTimeout(this.crackleTimer);
      this.scheduleNextCrackle();
    }
  }

  /**
   * Schedule the next crackle event
   */
  private scheduleNextCrackle(): void {
    if (this.state !== 'running') return;

    const config = this.config as MicrosoundConfig;
    
    // Calculate interval based on crackle rate
    // crackleRate 0.5 = roughly 1 crackle every 2 seconds
    const baseInterval = 1000 / (config.crackleRate + 0.01);
    const interval = baseInterval * (0.5 + Math.random() * 1.5);

    this.crackleTimer = window.setTimeout(() => {
      if (this.state === 'running') {
        this.triggerCrackle();
        this.scheduleNextCrackle();
      }
    }, Math.max(50, interval));
  }

  /**
   * Trigger a single crackle/glitch event
   */
  private triggerCrackle(): void {
    if (!this.audioContext) return;

    const config = this.config as MicrosoundConfig;
    const now = this.audioContext.currentTime;

    // Create noise-based crackle using a very short noise burst
    const noiseBuffer = this.createCrackleNoise();
    const source = this.audioContext.createBufferSource();
    source.buffer = noiseBuffer;

    // Playback rate variation for different textures
    source.playbackRate.value = 0.5 + Math.random() * 2.0;

    // Envelope
    const envelope = this.audioContext.createGain();
    envelope.gain.value = 0;

    // Random pan
    const panner = this.audioContext.createStereoPanner();
    panner.pan.value = (Math.random() - 0.5) * config.panRandomization;

    // Bitcrusher simulation using a waveshaper
    const waveshaper = this.audioContext.createWaveShaper();
    const curve = this.createBitcrushCurve(config.bitDepth);
    // @ts-expect-error - TypeScript strict typing issue with Float32Array and ArrayBuffer
    waveshaper.curve = curve;

    // Filter for frequency shaping
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = config.filterFreq + Math.random() * 200;
    filter.Q.value = 2.0;

    // Connect: source -> waveshaper -> filter -> envelope -> panner -> inputNode
    source.connect(waveshaper);
    waveshaper.connect(filter);
    filter.connect(envelope);
    envelope.connect(panner);
    
    const inputNode = this.getInputNode();
    if (inputNode) {
      panner.connect(inputNode);
    }

    // Very short envelope for crackle
    const duration = config.crackleDuration;
    const peakGain = config.crackleIntensity * 0.5;

    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(peakGain, now + duration * 0.2);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Start and stop
    source.start(now);
    source.stop(now + duration);

    // Cleanup
    const cleanupTimer = window.setTimeout(() => {
      try {
        source.disconnect();
        envelope.disconnect();
        panner.disconnect();
        waveshaper.disconnect();
        filter.disconnect();
      } catch {
        // Ignore if already disconnected
      }

      const index = this.activeCleanups.indexOf(cleanupTimer);
      if (index > -1) {
        this.activeCleanups.splice(index, 1);
      }
    }, (duration + 0.1) * 1000);

    this.activeCleanups.push(cleanupTimer);
    this.metrics.activeNodes = this.activeCleanups.length * 5;
  }

  /**
   * Create a very short noise buffer for crackle
   */
  private createCrackleNoise(): AudioBuffer {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    const config = this.config as MicrosoundConfig;
    const sampleRate = this.audioContext.sampleRate / config.sampleRateReduction;
    const bufferSize = Math.floor(sampleRate * config.crackleDuration);
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    // White noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  /**
   * Create a bitcrush waveshaper curve
   */
  private createBitcrushCurve(bitDepth: number): Float32Array {
    const config = this.config as MicrosoundConfig;
    
    // Add bit depth variation
    const actualBitDepth = bitDepth + 
      (Math.random() - 0.5) * config.bitDepthVariation;
    
    const steps = Math.pow(2, Math.max(4, Math.floor(actualBitDepth)));
    const samples = 65536;
    const curve = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2 / samples) - 1; // -1 to 1
      const quantized = Math.round(x * steps) / steps;
      curve[i] = Math.max(-1, Math.min(1, quantized));
    }

    return curve;
  }
}
