/**
 * Neural Sonification Module - Rung 8
 * 
 * Machine minds: Architecture of thought
 * 
 * Creates neural activation patterns using clusters of sine oscillators with
 * LFO-driven frequency shifts, representing internal structure adjusting.
 * Sparse events trigger sudden frequency shifts across the network.
 */

import { BaseAudioModule } from '../BaseAudioModule';
import type { AudioModuleConfig, NeuralSonificationConfig } from '../AudioModuleTypes';

export class NeuralSonificationModule extends BaseAudioModule {
  // Neural oscillators (always running)
  private oscillators: OscillatorNode[] = [];
  private oscillatorGains: GainNode[] = [];
  
  // LFOs for continuous frequency modulation
  private lfos: OscillatorNode[] = [];
  private lfoGains: GainNode[] = [];
  
  // Event triggering
  private eventTimer: number | null = null;

  protected getDefaultConfig(): AudioModuleConfig {
    return {
      masterGain: 0.16,
      panWidth: 0.4,
      lowCutoff: 100,
      highCutoff: 1500,
      density: 0.4,
      complexity: 0.6,
      oscillatorCount: 6,
      freqMin: 150,
      freqMax: 600,
      lfoCount: 3,
      lfoRateMin: 0.01,
      lfoRateMax: 0.05,
      lfoDepth: 50,
      eventProbability: 0.02,
      eventMagnitude: 100,
      oscillatorGains: [1.0, 0.8, 0.6, 0.5, 0.4, 0.3],
    };
  }

  protected onInit(): void {
    if (!this.audioContext) return;

    const config = this.config as NeuralSonificationConfig;

    // Create neural oscillators
    for (let i = 0; i < config.oscillatorCount; i++) {
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      
      // Random initial frequency
      const freq = config.freqMin + Math.random() * (config.freqMax - config.freqMin);
      osc.frequency.value = freq;

      // Gain for this oscillator
      const gain = this.audioContext.createGain();
      const normalizedGain = config.oscillatorGains[i] || (1.0 / (i + 1));
      gain.gain.value = normalizedGain * 0.15; // Keep quiet

      // Connect: osc -> gain -> inputNode
      osc.connect(gain);
      const inputNode = this.getInputNode();
      if (inputNode) {
        gain.connect(inputNode);
      }

      this.oscillators.push(osc);
      this.oscillatorGains.push(gain);
    }

    // Create LFOs for continuous frequency modulation
    for (let i = 0; i < config.lfoCount; i++) {
      const lfo = this.audioContext.createOscillator();
      lfo.type = 'sine';
      
      const lfoRate = config.lfoRateMin + 
        Math.random() * (config.lfoRateMax - config.lfoRateMin);
      lfo.frequency.value = lfoRate;

      const lfoGain = this.audioContext.createGain();
      lfoGain.gain.value = config.lfoDepth;

      // Connect LFO to multiple oscillators (network effect)
      lfo.connect(lfoGain);
      
      // Each LFO affects 2-3 random oscillators
      const affectedCount = 2 + Math.floor(Math.random() * 2);
      const affectedIndices = this.getRandomIndices(config.oscillatorCount, affectedCount);
      
      affectedIndices.forEach(idx => {
        if (this.oscillators[idx]) {
          lfoGain.connect(this.oscillators[idx].frequency);
        }
      });

      this.lfos.push(lfo);
      this.lfoGains.push(lfoGain);
    }

    this.metrics.activeNodes = config.oscillatorCount + config.lfoCount * 2;
  }

  protected onStart(): void {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Start all oscillators
    this.oscillators.forEach(osc => osc.start(now));
    
    // Start all LFOs
    this.lfos.forEach(lfo => lfo.start(now));

    // Start event triggering
    this.scheduleNextEvent();
  }

  protected onStop(): void {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Stop event scheduling
    if (this.eventTimer !== null) {
      clearTimeout(this.eventTimer);
      this.eventTimer = null;
    }

    // Stop oscillators
    this.oscillators.forEach(osc => {
      try {
        osc.stop(now);
      } catch {
        // Ignore if already stopped
      }
    });

    // Stop LFOs
    this.lfos.forEach(lfo => {
      try {
        lfo.stop(now);
      } catch {
        // Ignore if already stopped
      }
    });
  }

  protected onDestroy(): void {
    // Disconnect all nodes
    this.oscillators.forEach(osc => {
      try {
        osc.disconnect();
      } catch {
        // Ignore disconnection errors
      }
    });

    this.oscillatorGains.forEach(gain => {
      try {
        gain.disconnect();
      } catch {
        // Ignore disconnection errors
      }
    });

    this.lfos.forEach(lfo => {
      try {
        lfo.disconnect();
      } catch {
        // Ignore disconnection errors
      }
    });

    this.lfoGains.forEach(gain => {
      try {
        gain.disconnect();
      } catch {
        // Ignore disconnection errors
      }
    });

    this.oscillators = [];
    this.oscillatorGains = [];
    this.lfos = [];
    this.lfoGains = [];

    this.metrics.activeNodes = 0;
  }

  protected onConfigUpdate(config: Partial<AudioModuleConfig>): void {
    if (!this.audioContext) return;

    const fullConfig = this.config as NeuralSonificationConfig;
    const now = this.audioContext.currentTime;

    // Update oscillator gains
    if (config.oscillatorGains) {
      this.oscillatorGains.forEach((gain, i) => {
        const normalizedGain = fullConfig.oscillatorGains[i] || (1.0 / (i + 1));
        gain.gain.setTargetAtTime(normalizedGain * 0.15, now, 0.1);
      });
    }

    // Update LFO depth
    if (config.lfoDepth !== undefined) {
      this.lfoGains.forEach(gain => {
        gain.gain.setTargetAtTime(fullConfig.lfoDepth, now, 0.1);
      });
    }
  }

  /**
   * Schedule next neural activation event
   */
  private scheduleNextEvent(): void {
    if (this.state !== 'running') return;

    const config = this.config as NeuralSonificationConfig;
    
    // Events occur based on probability
    // eventProbability 0.02 with ~1 second checks = ~2% chance per second
    const checkInterval = 1000;

    this.eventTimer = window.setTimeout(() => {
      if (this.state === 'running') {
        if (Math.random() < config.eventProbability) {
          this.triggerNeuralEvent();
        }
        this.scheduleNextEvent();
      }
    }, checkInterval);
  }

  /**
   * Trigger a neural activation event (sudden frequency shift)
   */
  private triggerNeuralEvent(): void {
    if (!this.audioContext) return;

    const config = this.config as NeuralSonificationConfig;
    const now = this.audioContext.currentTime;

    // Select 1-3 random oscillators to shift
    const affectedCount = 1 + Math.floor(Math.random() * 3);
    const affectedIndices = this.getRandomIndices(config.oscillatorCount, affectedCount);

    affectedIndices.forEach(idx => {
      const osc = this.oscillators[idx];
      if (!osc) return;

      // Current frequency
      const currentFreq = osc.frequency.value;
      
      // New target frequency (jump within range)
      const newFreq = config.freqMin + Math.random() * (config.freqMax - config.freqMin);
      const magnitude = config.eventMagnitude;

      // Rapid frequency shift (creates a momentary activation)
      osc.frequency.cancelScheduledValues(now);
      osc.frequency.setValueAtTime(currentFreq, now);
      osc.frequency.linearRampToValueAtTime(currentFreq + magnitude, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(newFreq, now + 0.5);
    });
  }

  /**
   * Get random unique indices
   */
  private getRandomIndices(max: number, count: number): number[] {
    const indices: number[] = [];
    const available = Array.from({ length: max }, (_, i) => i);
    
    for (let i = 0; i < Math.min(count, max); i++) {
      const randomIdx = Math.floor(Math.random() * available.length);
      indices.push(available[randomIdx]);
      available.splice(randomIdx, 1);
    }
    
    return indices;
  }
}
