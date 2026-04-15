/**
 * Synthetic Chimes Module - Rung 7
 * 
 * Humans: Abstraction and representation
 * 
 * Creates gentle synthetic chimes with inharmonic partials, representing
 * thought clusters forming and dissolving. Very slow, sparse events with
 * long decay times.
 */

import { BaseAudioModule } from '../BaseAudioModule';
import type { AudioModuleConfig, SyntheticChimesConfig } from '../AudioModuleTypes';
import type { VisualModuleEvent, NodeActivatedEvent } from '../../visualModules/VisualModuleEvents';

export class SyntheticChimesModule extends BaseAudioModule {
  private chimeTimer: number | null = null;
  private activeCleanups: number[] = [];

  protected getDefaultConfig(): AudioModuleConfig {
    return {
      masterGain: 0.15,
      panWidth: 0.6,
      lowCutoff: 200,
      highCutoff: 3000,
      density: 0.2,
      complexity: 0.3,
      chimeDensity: 1.5,
      clusterProbability: 0.2,
      clusterSize: 3,
      fundamentalFreqs: [330, 440, 550, 660],
      inharmonicity: 0.05,
      brightness: 0.4,
      attackTime: 0.01,
      decayTime: 4.0,
      peakGain: 0.18,
      stereoVariation: 0.5,
    };
  }

  protected onInit(): void {
    // Event-based synthesis
  }

  protected onStart(): void {
    this.scheduleNextChime();
  }

  protected onStop(): void {
    if (this.chimeTimer !== null) {
      clearTimeout(this.chimeTimer);
      this.chimeTimer = null;
    }

    this.activeCleanups.forEach(timer => clearTimeout(timer));
    this.activeCleanups = [];
  }

  protected onDestroy(): void {
    this.onStop();
    this.metrics.activeNodes = 0;
  }

  protected onConfigUpdate(config: Partial<AudioModuleConfig>): void {
    if (config.chimeDensity !== undefined && this.chimeTimer !== null) {
      clearTimeout(this.chimeTimer);
      this.scheduleNextChime();
    }
  }

  /**
   * Handle events from visual modules
   * When a node is activated (flash), trigger a synchronized chime
   */
  handleVisualEvent(event: VisualModuleEvent): void {
    if (event.type === 'node-activated') {
      const nodeEvent = event as NodeActivatedEvent;
      // Trigger a chime synchronized with the node flash
      this.triggerChimeForNode(nodeEvent);
    }
  }

  /**
   * Trigger a chime specifically for a node activation event
   * Uses slightly different parameters to make it distinct and synchronized
   */
  private triggerChimeForNode(nodeEvent: NodeActivatedEvent): void {
    if (!this.audioContext) return;

    const config = this.config as SyntheticChimesConfig;
    const now = this.audioContext.currentTime;

    // Adjust frequency based on node properties
    // More connections = slightly higher frequency
    const connectionCount = nodeEvent.data?.connectionCount || 0;
    const complexityFactor = Math.min(1.3, 1.0 + (connectionCount / 20)); // Cap at 30% increase
    
    // Select fundamental frequency and adjust by complexity
    const baseFundamental = config.fundamentalFreqs[
      Math.floor(Math.random() * config.fundamentalFreqs.length)
    ];
    const fundamental = baseFundamental * complexityFactor;

    // Create inharmonic partials (like a bell)
    const partialCount = 3 + Math.floor(Math.random() * 3); // 3-5 partials
    const partials: Array<{ osc: OscillatorNode; gain: GainNode }> = [];

    // Master envelope for the chime
    const masterEnvelope = this.audioContext.createGain();
    masterEnvelope.gain.value = 0;

    // Stereo position (slightly more centered for synchronized events)
    const panner = this.audioContext.createStereoPanner();
    panner.pan.value = (Math.random() - 0.5) * config.stereoVariation * 0.7; // 30% less spread

    // Create partials
    for (let i = 0; i < partialCount; i++) {
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';

      // Inharmonic frequency calculation (bell-like)
      const partialRatio = (i + 1) * (1 + config.inharmonicity * (i + 1) * Math.random());
      const freq = fundamental * partialRatio;
      osc.frequency.value = freq;

      // Partial gain (higher partials are quieter)
      const gain = this.audioContext.createGain();
      const partialGain = 1.0 / Math.pow(i + 1, 1 + config.brightness);
      gain.gain.value = partialGain;

      // Different decay rates for each partial (higher = faster decay)
      const decayMultiplier = 1.0 / (1 + i * 0.3);
      const decayTime = config.decayTime * decayMultiplier;

      // Envelope for this partial
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(partialGain, now + config.attackTime);
      gain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

      // Connect: osc -> gain -> masterEnvelope
      osc.connect(gain);
      gain.connect(masterEnvelope);

      // Start and stop
      osc.start(now);
      osc.stop(now + decayTime + 0.1);

      partials.push({ osc, gain });
    }

    // Connect master envelope: masterEnvelope -> panner -> inputNode
    masterEnvelope.connect(panner);
    const inputNode = this.getInputNode();
    if (inputNode) {
      panner.connect(inputNode);
    }

    // Master envelope (slightly louder and faster attack for synchronized events)
    const peakGain = config.peakGain * 1.2; // 20% louder
    const attackTime = config.attackTime * 0.8; // 20% faster attack
    masterEnvelope.gain.setValueAtTime(0, now);
    masterEnvelope.gain.linearRampToValueAtTime(peakGain, now + attackTime);
    masterEnvelope.gain.exponentialRampToValueAtTime(0.001, now + config.decayTime);

    // Cleanup after longest decay
    const cleanupTime = config.decayTime + 0.5;
    const cleanupTimer = window.setTimeout(() => {
      try {
        partials.forEach(({ osc, gain }) => {
          osc.disconnect();
          gain.disconnect();
        });
        masterEnvelope.disconnect();
        panner.disconnect();
      } catch {
        // Ignore if already disconnected
      }

      const index = this.activeCleanups.indexOf(cleanupTimer);
      if (index > -1) {
        this.activeCleanups.splice(index, 1);
      }
    }, cleanupTime * 1000);

    this.activeCleanups.push(cleanupTimer);
    this.metrics.activeNodes = this.activeCleanups.length * 10; // Approximate
  }

  /**
   * Schedule the next chime event (or cluster)
   */
  private scheduleNextChime(): void {
    if (this.state !== 'running') return;

    const config = this.config as SyntheticChimesConfig;
    
    // Calculate interval based on chime density
    // chimeDensity 1.5 = roughly 1.5 chimes per minute = ~40 second interval
    const baseInterval = 60000 / (config.chimeDensity + 0.01);
    const interval = baseInterval * (0.5 + Math.random());

    this.chimeTimer = window.setTimeout(() => {
      if (this.state === 'running') {
        // Randomly trigger cluster or single chime
        if (Math.random() < config.clusterProbability) {
          this.triggerChimeCluster();
        } else {
          this.triggerChime();
        }
        
        this.scheduleNextChime();
      }
    }, Math.max(1000, interval));
  }

  /**
   * Trigger a cluster of chimes
   */
  private triggerChimeCluster(): void {
    const config = this.config as SyntheticChimesConfig;
    const clusterSize = Math.floor(2 + Math.random() * (config.clusterSize - 1));

    for (let i = 0; i < clusterSize; i++) {
      setTimeout(() => {
        if (this.state === 'running') {
          this.triggerChime();
        }
      }, i * 200 + Math.random() * 300);
    }
  }

  /**
   * Trigger a single chime
   */
  private triggerChime(): void {
    if (!this.audioContext) return;

    const config = this.config as SyntheticChimesConfig;
    const now = this.audioContext.currentTime;

    // Select fundamental frequency
    const fundamental = config.fundamentalFreqs[
      Math.floor(Math.random() * config.fundamentalFreqs.length)
    ];

    // Create inharmonic partials (like a bell)
    const partialCount = 3 + Math.floor(Math.random() * 3); // 3-5 partials
    const partials: Array<{ osc: OscillatorNode; gain: GainNode }> = [];

    // Master envelope for the chime
    const masterEnvelope = this.audioContext.createGain();
    masterEnvelope.gain.value = 0;

    // Stereo position
    const panner = this.audioContext.createStereoPanner();
    panner.pan.value = (Math.random() - 0.5) * config.stereoVariation;

    // Create partials
    for (let i = 0; i < partialCount; i++) {
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';

      // Inharmonic frequency calculation (bell-like)
      const partialRatio = (i + 1) * (1 + config.inharmonicity * (i + 1) * Math.random());
      const freq = fundamental * partialRatio;
      osc.frequency.value = freq;

      // Partial gain (higher partials are quieter)
      const gain = this.audioContext.createGain();
      const partialGain = 1.0 / Math.pow(i + 1, 1 + config.brightness);
      gain.gain.value = partialGain;

      // Different decay rates for each partial (higher = faster decay)
      const decayMultiplier = 1.0 / (1 + i * 0.3);
      const decayTime = config.decayTime * decayMultiplier;

      // Envelope for this partial
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(partialGain, now + config.attackTime);
      gain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

      // Connect: osc -> gain -> masterEnvelope
      osc.connect(gain);
      gain.connect(masterEnvelope);

      // Start and stop
      osc.start(now);
      osc.stop(now + decayTime + 0.1);

      partials.push({ osc, gain });
    }

    // Connect master envelope: masterEnvelope -> panner -> inputNode
    masterEnvelope.connect(panner);
    const inputNode = this.getInputNode();
    if (inputNode) {
      panner.connect(inputNode);
    }

    // Master envelope (controls overall chime volume)
    const peakGain = config.peakGain;
    masterEnvelope.gain.setValueAtTime(0, now);
    masterEnvelope.gain.linearRampToValueAtTime(peakGain, now + config.attackTime);
    masterEnvelope.gain.exponentialRampToValueAtTime(0.001, now + config.decayTime);

    // Cleanup after longest decay
    const cleanupTime = config.decayTime + 0.5;
    const cleanupTimer = window.setTimeout(() => {
      try {
        partials.forEach(({ osc, gain }) => {
          osc.disconnect();
          gain.disconnect();
        });
        masterEnvelope.disconnect();
        panner.disconnect();
      } catch {
        // Ignore if already disconnected
      }

      const index = this.activeCleanups.indexOf(cleanupTimer);
      if (index > -1) {
        this.activeCleanups.splice(index, 1);
      }
    }, cleanupTime * 1000);

    this.activeCleanups.push(cleanupTimer);
    this.metrics.activeNodes = this.activeCleanups.length * 10; // Approximate
  }
}
