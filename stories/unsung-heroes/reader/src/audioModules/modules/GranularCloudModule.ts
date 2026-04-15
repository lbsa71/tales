/**
 * Granular Cloud Module - Rung 2
 * 
 * Protocells: Boundary control
 * 
 * Creates a slow, evolving cloud of granular textures using multiple concurrent
 * grains with varying pitch, duration, and spatial position. Represents the
 * morphogenesis and boundary formation of protocells.
 */

import { BaseAudioModule } from '../BaseAudioModule';
import type { AudioModuleConfig, GranularCloudConfig } from '../AudioModuleTypes';

interface Grain {
  oscillator: OscillatorNode;
  gain: GainNode;
  panner: StereoPannerNode;
  startTime: number;
  duration: number;
  cleanupTimer: number;
}

export class GranularCloudModule extends BaseAudioModule {
  private activeGrains: Grain[] = [];
  private grainSpawnInterval: number | null = null;

  protected getDefaultConfig(): AudioModuleConfig {
    return {
      masterGain: 0.18,
      panWidth: 0.5,
      lowCutoff: 80,
      highCutoff: 800,
      density: 0.3,
      complexity: 0.4,
      minConcurrentGrains: 5,
      maxConcurrentGrains: 12,
      spawnRate: 0.5,
      grainDurationMin: 0.5,
      grainDurationMax: 2.0,
      grainPitchMin: 120,
      grainPitchMax: 300,
      grainPitchVariation: 0.15,
      stereoSpread: 0.6,
      spatialMovement: 0.03,
      grainShape: 'triangle',
      envelopeShape: 'gaussian',
    };
  }

  protected onInit(): void {
    // No pre-initialization needed for granular synthesis
    // Grains are created dynamically
  }

  protected onStart(): void {
    if (!this.audioContext) return;

    const config = this.config as GranularCloudConfig;

    // Spawn initial grains to reach minimum concurrent count
    const initialGrains = Math.floor(
      (config.minConcurrentGrains + config.maxConcurrentGrains) / 2
    );
    
    for (let i = 0; i < initialGrains; i++) {
      setTimeout(() => {
        if (this.state === 'running') {
          this.spawnGrain();
        }
      }, Math.random() * 500);
    }

    // Start continuous grain spawning
    this.scheduleNextSpawn();
  }

  protected onStop(): void {
    // Stop spawning new grains
    if (this.grainSpawnInterval !== null) {
      clearTimeout(this.grainSpawnInterval);
      this.grainSpawnInterval = null;
    }

    // Stop all active grains
    this.activeGrains.forEach(grain => {
      this.stopGrain(grain);
    });

    this.activeGrains = [];
  }

  protected onDestroy(): void {
    // Clean up any remaining grains
    this.activeGrains.forEach(grain => {
      clearTimeout(grain.cleanupTimer);
      this.stopGrain(grain);
    });

    this.activeGrains = [];
    this.metrics.activeNodes = 0;
  }

  protected onConfigUpdate(config: Partial<AudioModuleConfig>): void {
    // Dynamic config updates affect future grains
    // Current grains continue with their original parameters
    if (config.spawnRate !== undefined) {
      // Reschedule spawning if rate changed
      if (this.grainSpawnInterval !== null) {
        clearTimeout(this.grainSpawnInterval);
        this.scheduleNextSpawn();
      }
    }
  }

  /**
   * Schedule the next grain spawn
   */
  private scheduleNextSpawn(): void {
    if (this.state !== 'running') return;

    const config = this.config as GranularCloudConfig;
    
    // Calculate interval based on spawn rate
    // spawnRate 0.5 = ~2 seconds average interval
    const baseInterval = 1000 / (config.spawnRate + 0.1); // Avoid division by zero
    const interval = baseInterval * (0.5 + Math.random());

    this.grainSpawnInterval = window.setTimeout(() => {
      if (this.state === 'running') {
        // Spawn grain if under max concurrent limit
        if (this.activeGrains.length < config.maxConcurrentGrains) {
          this.spawnGrain();
        }
        
        this.scheduleNextSpawn();
      }
    }, interval);
  }

  /**
   * Spawn a single grain
   */
  private spawnGrain(): void {
    if (!this.audioContext) return;

    const config = this.config as GranularCloudConfig;
    const now = this.audioContext.currentTime;

    // Create grain oscillator
    const osc = this.audioContext.createOscillator();
    osc.type = config.grainShape;

    // Random pitch with variation
    const basePitch = config.grainPitchMin + 
      Math.random() * (config.grainPitchMax - config.grainPitchMin);
    const pitchVariation = basePitch * config.grainPitchVariation;
    const pitch = basePitch + (Math.random() - 0.5) * pitchVariation;
    osc.frequency.value = pitch;

    // Random duration
    const duration = config.grainDurationMin + 
      Math.random() * (config.grainDurationMax - config.grainDurationMin);

    // Create gain envelope
    const gain = this.audioContext.createGain();
    gain.gain.value = 0;

    // Create stereo panner
    const panner = this.audioContext.createStereoPanner();
    const panPos = (Math.random() - 0.5) * config.stereoSpread;
    panner.pan.value = panPos;

    // Optional: Add slow spatial movement during grain life
    if (config.spatialMovement > 0) {
      const panEnd = panPos + (Math.random() - 0.5) * config.spatialMovement;
      panner.pan.linearRampToValueAtTime(panEnd, now + duration);
    }

    // Connect: osc -> gain -> panner -> inputNode
    osc.connect(gain);
    gain.connect(panner);
    const inputNode = this.getInputNode();
    if (inputNode) {
      panner.connect(inputNode);
    }

    // Apply envelope based on shape
    if (config.envelopeShape === 'gaussian') {
      // Gaussian-like envelope (smooth bell curve)
      const attackTime = duration * 0.3;
      const sustainTime = duration * 0.4;
      const peakGain = 0.2 / Math.sqrt(config.maxConcurrentGrains); // Normalize by grain count

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + attackTime);
      gain.gain.setValueAtTime(peakGain, now + attackTime + sustainTime);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    } else {
      // Linear envelope
      const peakGain = 0.2 / Math.sqrt(config.maxConcurrentGrains);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + duration * 0.5);
      gain.gain.linearRampToValueAtTime(0, now + duration);
    }

    // Start grain
    osc.start(now);
    osc.stop(now + duration);

    // Create grain record
    const grain: Grain = {
      oscillator: osc,
      gain,
      panner,
      startTime: now,
      duration,
      cleanupTimer: 0,
    };

    // Schedule cleanup
    grain.cleanupTimer = window.setTimeout(() => {
      this.removeGrain(grain);
    }, duration * 1000 + 100);

    this.activeGrains.push(grain);
    this.metrics.activeNodes = this.activeGrains.length * 3; // Each grain has 3 nodes
  }

  /**
   * Stop a grain immediately
   */
  private stopGrain(grain: Grain): void {
    try {
      grain.oscillator.stop();
      grain.oscillator.disconnect();
      grain.gain.disconnect();
      grain.panner.disconnect();
    } catch {
      // Ignore errors if already stopped/disconnected
    }
  }

  /**
   * Remove grain from active list
   */
  private removeGrain(grain: Grain): void {
    this.stopGrain(grain);
    
    const index = this.activeGrains.indexOf(grain);
    if (index > -1) {
      this.activeGrains.splice(index, 1);
      this.metrics.activeNodes = this.activeGrains.length * 3;
    }
  }
}
