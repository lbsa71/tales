/**
 * Stereo Shift Module - Rung 6
 * 
 * Sentient animals: Behavioral strategy
 * 
 * Creates soft shifting stereo pads using multiple voices with independent panning
 * modulation. Represents group behavior, cohesion, and spatial awareness of
 * sentient animals.
 */

import { BaseAudioModule } from '../BaseAudioModule';
import type { AudioModuleConfig, StereoShiftConfig } from '../AudioModuleTypes';

export class StereoShiftModule extends BaseAudioModule {
  private voices: OscillatorNode[] = [];
  private voiceGains: GainNode[] = [];
  private voicePanners: StereoPannerNode[] = [];
  
  // LFOs for panning modulation
  private panLFOs: OscillatorNode[] = [];
  private panLFOGains: GainNode[] = [];
  
  // Filter for warmth
  private voiceFilter: BiquadFilterNode | null = null;
  
  // Master envelope for smooth start
  private masterEnvelope: GainNode | null = null;

  protected getDefaultConfig(): AudioModuleConfig {
    return {
      masterGain: 0.16,
      panWidth: 0.8,
      lowCutoff: 80,
      highCutoff: 1200,
      density: 0.4,
      complexity: 0.45,
      voiceCount: 3,
      voiceFreqs: [165, 220, 330],
      voiceWaveform: 'triangle',
      panRate: 0.015,
      panDepth: 0.7,
      panPhaseOffset: 0.33,
      attackTime: 2.0,
      releaseTime: 3.0,
      filterCutoff: 800,
      filterResonance: 0.5,
    };
  }

  protected onInit(): void {
    if (!this.audioContext) return;

    const config = this.config as StereoShiftConfig;

    // Create master envelope for smooth fade
    this.masterEnvelope = this.audioContext.createGain();
    this.masterEnvelope.gain.value = 0;

    // Create voice filter
    this.voiceFilter = this.audioContext.createBiquadFilter();
    this.voiceFilter.type = 'lowpass';
    this.voiceFilter.frequency.value = config.filterCutoff;
    this.voiceFilter.Q.value = config.filterResonance;

    // Connect filter to core chain
    const inputNode = this.getInputNode();
    if (inputNode) {
      this.voiceFilter.connect(inputNode);
    }

    // Create voices
    for (let i = 0; i < config.voiceCount; i++) {
      // Voice oscillator
      const voice = this.audioContext.createOscillator();
      voice.type = config.voiceWaveform;
      voice.frequency.value = config.voiceFreqs[i] || 220;

      // Voice gain
      const gain = this.audioContext.createGain();
      gain.gain.value = 0.4 / config.voiceCount; // Normalize by voice count

      // Stereo panner for this voice
      const panner = this.audioContext.createStereoPanner();
      panner.pan.value = 0;

      // Pan modulation LFO
      const panLFO = this.audioContext.createOscillator();
      panLFO.type = 'sine';
      // Each voice gets slightly different pan rate and phase
      const phaseOffset = i * config.panPhaseOffset;
      panLFO.frequency.value = config.panRate * (1 + phaseOffset * 0.2);

      const panLFOGain = this.audioContext.createGain();
      panLFOGain.gain.value = config.panDepth;

      // Connect pan LFO: panLFO -> panLFOGain -> panner.pan
      panLFO.connect(panLFOGain);
      panLFOGain.connect(panner.pan);

      // Connect voice: voice -> gain -> panner -> masterEnvelope -> filter
      voice.connect(gain);
      gain.connect(panner);
      panner.connect(this.masterEnvelope);

      // Store references
      this.voices.push(voice);
      this.voiceGains.push(gain);
      this.voicePanners.push(panner);
      this.panLFOs.push(panLFO);
      this.panLFOGains.push(panLFOGain);
    }

    // Connect master envelope to filter
    this.masterEnvelope.connect(this.voiceFilter);

    this.metrics.activeNodes = config.voiceCount * 5 + 2; // Voices + filter + envelope
  }

  protected onStart(): void {
    if (!this.audioContext || !this.masterEnvelope) return;

    const config = this.config as StereoShiftConfig;
    const now = this.audioContext.currentTime;

    // Start all voices and LFOs with slight time offsets for organic feel
    this.voices.forEach((voice, i) => {
      voice.start(now + i * 0.05);
    });

    this.panLFOs.forEach((lfo, i) => {
      // Start LFOs with phase offsets
      lfo.start(now + i * config.panPhaseOffset);
    });

    // Slow attack envelope
    this.masterEnvelope.gain.setValueAtTime(0, now);
    this.masterEnvelope.gain.linearRampToValueAtTime(1.0, now + config.attackTime);
  }

  protected onStop(): void {
    if (!this.audioContext || !this.masterEnvelope) return;

    const config = this.config as StereoShiftConfig;
    const now = this.audioContext.currentTime;

    // Slow release envelope
    this.masterEnvelope.gain.cancelScheduledValues(now);
    this.masterEnvelope.gain.setValueAtTime(this.masterEnvelope.gain.value, now);
    this.masterEnvelope.gain.linearRampToValueAtTime(0, now + config.releaseTime);

    // Stop all oscillators after release
    const stopTime = now + config.releaseTime;
    
    this.voices.forEach(voice => {
      try {
        voice.stop(stopTime);
      } catch {
        // Ignore if already stopped
      }
    });

    this.panLFOs.forEach(lfo => {
      try {
        lfo.stop(stopTime);
      } catch {
        // Ignore if already stopped
      }
    });
  }

  protected onDestroy(): void {
    // Disconnect and clear all nodes
    this.voices.forEach(voice => {
      try {
        voice.disconnect();
      } catch {
        // Ignore disconnection errors
      }
    });

    this.voiceGains.forEach(gain => {
      try {
        gain.disconnect();
      } catch {
        // Ignore disconnection errors
      }
    });

    this.voicePanners.forEach(panner => {
      try {
        panner.disconnect();
      } catch {
        // Ignore disconnection errors
      }
    });

    this.panLFOs.forEach(lfo => {
      try {
        lfo.disconnect();
      } catch {
        // Ignore disconnection errors
      }
    });

    this.panLFOGains.forEach(gain => {
      try {
        gain.disconnect();
      } catch {
        // Ignore disconnection errors
      }
    });

    if (this.voiceFilter) {
      this.voiceFilter.disconnect();
      this.voiceFilter = null;
    }

    if (this.masterEnvelope) {
      this.masterEnvelope.disconnect();
      this.masterEnvelope = null;
    }

    // Clear arrays
    this.voices = [];
    this.voiceGains = [];
    this.voicePanners = [];
    this.panLFOs = [];
    this.panLFOGains = [];

    this.metrics.activeNodes = 0;
  }

  protected onConfigUpdate(config: Partial<AudioModuleConfig>): void {
    if (!this.audioContext) return;

    const fullConfig = this.config as StereoShiftConfig;
    const now = this.audioContext.currentTime;

    // Update voice gains
    if (config.voiceCount !== undefined) {
      this.voiceGains.forEach(gain => {
        gain.gain.setTargetAtTime(0.4 / fullConfig.voiceCount, now, 0.1);
      });
    }

    // Update pan depth
    if (config.panDepth !== undefined) {
      this.panLFOGains.forEach(gain => {
        gain.gain.setTargetAtTime(fullConfig.panDepth, now, 0.1);
      });
    }

    // Update filter cutoff
    if (config.filterCutoff !== undefined && this.voiceFilter) {
      this.voiceFilter.frequency.setTargetAtTime(fullConfig.filterCutoff, now, 0.1);
    }

    // Update filter resonance
    if (config.filterResonance !== undefined && this.voiceFilter) {
      this.voiceFilter.Q.value = fullConfig.filterResonance;
    }
  }
}
