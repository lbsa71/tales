/**
 * Filtered Noise Module - Rung 1
 * 
 * Pre-cellular replicators: Chemical persistence
 * 
 * Creates a cosmic ambient soundscape using filtered pink noise with slow LFO modulation
 * and ultra-rare soft grains. Represents the diffuse, pre-intent patterns of early
 * chemical replication.
 */

import { BaseAudioModule } from '../BaseAudioModule';
import type { AudioModuleConfig, FilteredNoiseConfig } from '../AudioModuleTypes';

export class FilteredNoiseModule extends BaseAudioModule {
  // Noise generation
  private noiseBuffer: AudioBuffer | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;

  // Filter modulation
  private modulationFilter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  // Grain system
  private grainTimer: number | null = null;
  private grainCleanupTimers: number[] = [];

  protected getDefaultConfig(): AudioModuleConfig {
    return {
      masterGain: 0.30,
      panWidth: 0.3,
      lowCutoff: 100,
      highCutoff: 600,
      density: 0.2,
      complexity: 0.3,
      noiseType: 'pink',
      noiseGain: 0.24,
      filterFrequency: 300,
      filterQ: 0.5,
      filterModulationRate: 0.02,
      filterModulationDepth: 40,
      grainDensity: 0.001,
      grainDuration: 0.2,
      grainPitchMin: 150,
      grainPitchMax: 250,
      grainGain: 0.16,
    };
  }

  protected onInit(): void {
    if (!this.audioContext) return;

    const config = this.config as FilteredNoiseConfig;

    // Create pink noise buffer
    this.noiseBuffer = this.createNoiseBuffer(config.noiseType);

    // Create noise gain
    this.noiseGain = this.audioContext.createGain();
    this.noiseGain.gain.value = config.noiseGain;

    // Create modulation filter (bandpass for character)
    this.modulationFilter = this.audioContext.createBiquadFilter();
    this.modulationFilter.type = 'bandpass';
    this.modulationFilter.frequency.value = config.filterFrequency;
    this.modulationFilter.Q.value = config.filterQ;

    // Create LFO for slow filter modulation
    this.lfo = this.audioContext.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = config.filterModulationRate;

    // LFO gain controls modulation depth
    this.lfoGain = this.audioContext.createGain();
    this.lfoGain.gain.value = config.filterModulationDepth;

    // Connect LFO: lfo -> lfoGain -> filter.frequency
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.modulationFilter.frequency);

    // Connect audio chain: noiseGain -> modulationFilter -> inputNode (core filters)
    this.noiseGain.connect(this.modulationFilter);
    const inputNode = this.getInputNode();
    if (inputNode) {
      this.modulationFilter.connect(inputNode);
    }
  }

  protected onStart(): void {
    if (!this.audioContext || !this.noiseBuffer || !this.noiseGain) return;

    const config = this.config as FilteredNoiseConfig;

    // Start noise source
    this.noiseSource = this.audioContext.createBufferSource();
    this.noiseSource.buffer = this.noiseBuffer;
    this.noiseSource.loop = true;
    this.noiseSource.connect(this.noiseGain);
    this.noiseSource.start();

    // Start LFO
    if (this.lfo) {
      this.lfo.start();
    }

    // Start grain scheduler
    this.scheduleNextGrain(config.grainDensity);
  }

  protected onStop(): void {
    // Stop noise source
    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
      } catch {
        // Ignore if already stopped
      }
      this.noiseSource = null;
    }

    // Stop grain timer
    if (this.grainTimer !== null) {
      clearTimeout(this.grainTimer);
      this.grainTimer = null;
    }

    // Clear any pending grain cleanup timers
    this.grainCleanupTimers.forEach(timer => clearTimeout(timer));
    this.grainCleanupTimers = [];
  }

  protected onDestroy(): void {
    // Disconnect nodes
    if (this.noiseGain) {
      this.noiseGain.disconnect();
      this.noiseGain = null;
    }

    if (this.modulationFilter) {
      this.modulationFilter.disconnect();
      this.modulationFilter = null;
    }

    if (this.lfo) {
      try {
        this.lfo.stop();
        this.lfo.disconnect();
      } catch {
        // Ignore if already stopped
      }
      this.lfo = null;
    }

    if (this.lfoGain) {
      this.lfoGain.disconnect();
      this.lfoGain = null;
    }

    this.noiseBuffer = null;
  }

  protected onConfigUpdate(config: Partial<AudioModuleConfig>): void {
    if (!this.audioContext) return;

    const fullConfig = this.config as FilteredNoiseConfig;

    if (this.noiseGain && config.noiseGain !== undefined) {
      this.noiseGain.gain.setTargetAtTime(
        fullConfig.noiseGain,
        this.audioContext.currentTime,
        0.1
      );
    }

    if (this.modulationFilter) {
      if (config.filterFrequency !== undefined) {
        this.modulationFilter.frequency.setTargetAtTime(
          fullConfig.filterFrequency,
          this.audioContext.currentTime,
          0.1
        );
      }
      if (config.filterQ !== undefined) {
        this.modulationFilter.Q.value = fullConfig.filterQ;
      }
    }

    if (this.lfo && config.filterModulationRate !== undefined) {
      this.lfo.frequency.setTargetAtTime(
        fullConfig.filterModulationRate,
        this.audioContext.currentTime,
        0.1
      );
    }

    if (this.lfoGain && config.filterModulationDepth !== undefined) {
      this.lfoGain.gain.setTargetAtTime(
        fullConfig.filterModulationDepth,
        this.audioContext.currentTime,
        0.1
      );
    }
  }

  /**
   * Create pink or brown noise buffer
   */
  private createNoiseBuffer(noiseType: 'pink' | 'brown'): AudioBuffer {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    if (noiseType === 'pink') {
      // Pink noise using Paul Kellet's algorithm
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else {
      // Brown noise (Brownian/red noise)
      let lastOut = 0;
      
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Compensate for amplitude loss
      }
    }

    return buffer;
  }

  /**
   * Schedule the next grain event
   */
  private scheduleNextGrain(density: number): void {
    if (this.state !== 'running') return;

    // Calculate interval based on density (lower density = longer intervals)
    // density 0.001 means roughly 1 grain every ~15-45 seconds
    const minInterval = 15000; // 15 seconds
    const maxInterval = 45000; // 45 seconds
    const interval = minInterval + Math.random() * (maxInterval - minInterval);

    this.grainTimer = setTimeout(() => {
      if (this.state === 'running') {
        // Only trigger if random check passes (adds even more sparseness)
        if (Math.random() < density) {
          this.triggerGrain();
        }
        this.scheduleNextGrain(density);
      }
    }, interval);
  }

  /**
   * Trigger a single soft grain
   */
  private triggerGrain(): void {
    if (!this.audioContext) return;

    const config = this.config as FilteredNoiseConfig;
    const now = this.audioContext.currentTime;

    // Create oscillator for grain
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    
    // Random pitch within range
    const pitch = config.grainPitchMin + Math.random() * (config.grainPitchMax - config.grainPitchMin);
    osc.frequency.value = pitch;

    // Grain envelope
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0;

    // Connect: osc -> gain -> inputNode
    osc.connect(gainNode);
    const inputNode = this.getInputNode();
    if (inputNode) {
      gainNode.connect(inputNode);
    }

    // Soft gaussian-like envelope
    const duration = config.grainDuration;
    const peakTime = duration * 0.3;
    const peakGain = config.grainGain;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(peakGain, now + peakTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Start and stop
    osc.start(now);
    osc.stop(now + duration);

    // Cleanup after grain
    const cleanupTimer = setTimeout(() => {
      osc.disconnect();
      gainNode.disconnect();
      // Remove this timer from the list
      const index = this.grainCleanupTimers.indexOf(cleanupTimer);
      if (index > -1) {
        this.grainCleanupTimers.splice(index, 1);
      }
    }, duration * 1000 + 100);

    // Track cleanup timer
    this.grainCleanupTimers.push(cleanupTimer);
  }
}
