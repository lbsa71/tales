/**
 * Sparse FM Module - Rung 3
 * 
 * RNA-world organisms: Fidelity of replication
 * 
 * Creates sparse FM synthesis events - gentle bleeps representing discrete
 * replication events in the RNA world. Uses frequency modulation to create
 * branching, organic timbres.
 */

import { BaseAudioModule } from '../BaseAudioModule';
import type { AudioModuleConfig, SparseFMConfig } from '../AudioModuleTypes';
import type { VisualModuleEvent, PlantCreatedEvent } from '../../visualModules/VisualModuleEvents';

export class SparseFMModule extends BaseAudioModule {
  private eventTimer: number | null = null;
  private activeEventCleanups: number[] = [];

  protected getDefaultConfig(): AudioModuleConfig {
    return {
      masterGain: 0.16,
      panWidth: 0.4,
      lowCutoff: 150,
      highCutoff: 1000,
      density: 0.25,
      complexity: 0.35,
      eventDensity: 3,
      eventVariation: 0.7,
      carrierFreqMin: 200,
      carrierFreqMax: 350,
      modulatorRatio: 2.0,
      modulationIndex: 50,
      attackTime: 0.1,
      decayTime: 0.6,
      peakGain: 0.12,
      carrierType: 'sine',
      modulatorType: 'sine',
    };
  }

  protected onInit(): void {
    // FM synthesis is event-based, no persistent nodes needed
  }

  protected onStart(): void {
    this.scheduleNextEvent();
  }

  protected onStop(): void {
    // Stop scheduling new events
    if (this.eventTimer !== null) {
      clearTimeout(this.eventTimer);
      this.eventTimer = null;
    }

    // Clear any pending cleanups
    this.activeEventCleanups.forEach(timer => clearTimeout(timer));
    this.activeEventCleanups = [];
  }

  protected onDestroy(): void {
    this.onStop();
    this.metrics.activeNodes = 0;
  }

  protected onConfigUpdate(config: Partial<AudioModuleConfig>): void {
    // Config updates affect future events
    if (config.eventDensity !== undefined) {
      // Reschedule next event with new density
      if (this.eventTimer !== null) {
        clearTimeout(this.eventTimer);
        this.scheduleNextEvent();
      }
    }
  }

  /**
   * Handle events from visual modules
   * When a new plant is created, trigger a synchronized FM tone
   */
  handleVisualEvent(event: VisualModuleEvent): void {
    if (event.type === 'plant-created') {
      const plantEvent = event as PlantCreatedEvent;
      // Trigger a synchronized FM tone for the new plant
      this.triggerFMEventForPlant(plantEvent);
    }
  }

  /**
   * Trigger an FM event specifically for a plant creation event
   * Uses slightly different parameters to make it distinct from autonomous events
   */
  private triggerFMEventForPlant(plantEvent: PlantCreatedEvent): void {
    if (!this.audioContext) return;

    const config = this.config as SparseFMConfig;
    const now = this.audioContext.currentTime;

    // Adjust frequency based on plant complexity (segment count)
    // More segments = slightly higher frequency
    const segmentCount = plantEvent.data?.segmentCount || 0;
    const complexityFactor = Math.min(1.2, 1.0 + (segmentCount / 1000)); // Cap at 20% increase
    
    const baseCarrierFreq = config.carrierFreqMin + 
      Math.random() * (config.carrierFreqMax - config.carrierFreqMin);
    const carrierFreq = baseCarrierFreq * complexityFactor;

    // Modulator frequency (ratio of carrier)
    const modulatorFreq = carrierFreq * config.modulatorRatio;

    // Create carrier oscillator
    const carrier = this.audioContext.createOscillator();
    carrier.type = config.carrierType;
    carrier.frequency.value = carrierFreq;

    // Create modulator oscillator
    const modulator = this.audioContext.createOscillator();
    modulator.type = config.modulatorType;
    modulator.frequency.value = modulatorFreq;

    // Modulation depth gain (slightly higher for plant events)
    const modGain = this.audioContext.createGain();
    modGain.gain.value = config.modulationIndex * 1.1; // 10% more modulation

    // Envelope gain for carrier (slightly louder for plant events)
    const envelope = this.audioContext.createGain();
    envelope.gain.value = 0;

    // Random stereo position
    const panner = this.audioContext.createStereoPanner();
    panner.pan.value = (Math.random() - 0.5) * config.panWidth;

    // Connect FM synthesis chain
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    
    carrier.connect(envelope);
    envelope.connect(panner);
    const inputNode = this.getInputNode();
    if (inputNode) {
      panner.connect(inputNode);
    }

    // Apply envelope (slightly faster attack for plant events)
    const attackTime = config.attackTime * 0.7; // 30% faster attack
    const decayTime = config.decayTime;
    const totalDuration = attackTime + decayTime;
    const peakGain = config.peakGain * 1.15; // 15% louder

    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(peakGain, now + attackTime);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + totalDuration);

    // Start oscillators
    carrier.start(now);
    modulator.start(now);

    // Stop oscillators after envelope
    carrier.stop(now + totalDuration + 0.1);
    modulator.stop(now + totalDuration + 0.1);

    // Schedule cleanup
    const cleanupTimer = window.setTimeout(() => {
      try {
        carrier.disconnect();
        modulator.disconnect();
        modGain.disconnect();
        envelope.disconnect();
        panner.disconnect();
      } catch {
        // Ignore if already disconnected
      }

      // Remove from active cleanups
      const index = this.activeEventCleanups.indexOf(cleanupTimer);
      if (index > -1) {
        this.activeEventCleanups.splice(index, 1);
      }
    }, (totalDuration + 0.2) * 1000);

    this.activeEventCleanups.push(cleanupTimer);
    this.metrics.activeNodes = this.activeEventCleanups.length * 5; // Approximate
  }

  /**
   * Schedule the next FM event
   */
  private scheduleNextEvent(): void {
    if (this.state !== 'running') return;

    const config = this.config as SparseFMConfig;
    
    // Calculate interval based on event density
    // eventDensity 3 = roughly 3 events per minute = ~20 second interval
    const baseInterval = (60000 / (config.eventDensity + 0.1)); // milliseconds
    const variation = baseInterval * config.eventVariation;
    const interval = baseInterval + (Math.random() - 0.5) * variation;

    this.eventTimer = window.setTimeout(() => {
      if (this.state === 'running') {
        this.triggerFMEvent();
        this.scheduleNextEvent();
      }
    }, Math.max(100, interval)); // Minimum 100ms
  }

  /**
   * Trigger a single FM synthesis event
   */
  private triggerFMEvent(): void {
    if (!this.audioContext) return;

    const config = this.config as SparseFMConfig;
    const now = this.audioContext.currentTime;

    // Random carrier frequency
    const carrierFreq = config.carrierFreqMin + 
      Math.random() * (config.carrierFreqMax - config.carrierFreqMin);

    // Modulator frequency (ratio of carrier)
    const modulatorFreq = carrierFreq * config.modulatorRatio;

    // Create carrier oscillator
    const carrier = this.audioContext.createOscillator();
    carrier.type = config.carrierType;
    carrier.frequency.value = carrierFreq;

    // Create modulator oscillator
    const modulator = this.audioContext.createOscillator();
    modulator.type = config.modulatorType;
    modulator.frequency.value = modulatorFreq;

    // Modulation depth gain
    const modGain = this.audioContext.createGain();
    modGain.gain.value = config.modulationIndex;

    // Envelope gain for carrier
    const envelope = this.audioContext.createGain();
    envelope.gain.value = 0;

    // Random stereo position
    const panner = this.audioContext.createStereoPanner();
    panner.pan.value = (Math.random() - 0.5) * config.panWidth;

    // Connect FM synthesis chain:
    // modulator -> modGain -> carrier.frequency
    // carrier -> envelope -> panner -> inputNode
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    
    carrier.connect(envelope);
    envelope.connect(panner);
    const inputNode = this.getInputNode();
    if (inputNode) {
      panner.connect(inputNode);
    }

    // Apply envelope (attack-decay)
    const attackTime = config.attackTime;
    const decayTime = config.decayTime;
    const totalDuration = attackTime + decayTime;
    const peakGain = config.peakGain;

    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(peakGain, now + attackTime);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + totalDuration);

    // Start oscillators
    carrier.start(now);
    modulator.start(now);

    // Stop oscillators after envelope
    carrier.stop(now + totalDuration + 0.1);
    modulator.stop(now + totalDuration + 0.1);

    // Schedule cleanup
    const cleanupTimer = window.setTimeout(() => {
      try {
        carrier.disconnect();
        modulator.disconnect();
        modGain.disconnect();
        envelope.disconnect();
        panner.disconnect();
      } catch {
        // Ignore if already disconnected
      }

      // Remove from active cleanups
      const index = this.activeEventCleanups.indexOf(cleanupTimer);
      if (index > -1) {
        this.activeEventCleanups.splice(index, 1);
      }
    }, (totalDuration + 0.2) * 1000);

    this.activeEventCleanups.push(cleanupTimer);
    this.metrics.activeNodes = this.activeEventCleanups.length * 5; // Approximate
  }
}
