/**
 * Additive Drone Module - Rung 5
 * 
 * Multicellular life: Specialization
 * 
 * Creates a rich harmonic drone using multiple oscillators with slow phase drift
 * and amplitude variation. Represents the coordination and specialization of
 * multicellular organisms.
 */

import { BaseAudioModule } from '../BaseAudioModule';
import type { AudioModuleConfig, AdditiveDroneConfig } from '../AudioModuleTypes';

export class AdditiveDroneModule extends BaseAudioModule {
  private oscillators: OscillatorNode[] = [];
  private oscillatorGains: GainNode[] = [];
  
  // LFOs for phase drift
  private phaseDriftLFOs: OscillatorNode[] = [];
  private phaseDriftGains: GainNode[] = [];
  
  // Amplitude variation LFOs
  private ampVariationLFOs: OscillatorNode[] = [];
  private ampVariationGains: GainNode[] = [];

  protected getDefaultConfig(): AudioModuleConfig {
    return {
      masterGain: 0.17,
      panWidth: 0.3,
      lowCutoff: 60,
      highCutoff: 800,
      density: 0.5,
      complexity: 0.5,
      oscillatorCount: 4,
      fundamentalFreq: 110,
      harmonic: true,
      harmonicRatios: [1.0, 2.0, 3.0, 4.0],
      phaseDriftRate: 0.01,
      phaseDriftDepth: 0.3,
      amplitudeVariation: 0.15,
      oscillatorGains: [1.0, 0.5, 0.3, 0.2],
      detuning: 5,
    };
  }

  protected onInit(): void {
    if (!this.audioContext) return;

    const config = this.config as AdditiveDroneConfig;
    const count = Math.min(config.oscillatorCount, config.harmonicRatios.length);

    // Create oscillators and their supporting nodes
    for (let i = 0; i < count; i++) {
      // Create oscillator
      const osc = this.audioContext.createOscillator();
      osc.type = 'sine';
      
      // Calculate frequency (harmonic or slightly detuned)
      const baseFreq = config.fundamentalFreq * config.harmonicRatios[i];
      const detuneAmount = (Math.random() - 0.5) * config.detuning;
      osc.frequency.value = baseFreq;
      osc.detune.value = detuneAmount;

      // Create gain for this oscillator
      const gain = this.audioContext.createGain();
      const normalizedGain = config.oscillatorGains[i] || (1.0 / (i + 1));
      gain.gain.value = normalizedGain * 0.25; // Scale down to avoid clipping

      // Phase drift LFO (slow frequency modulation)
      const phaseLFO = this.audioContext.createOscillator();
      phaseLFO.type = 'sine';
      phaseLFO.frequency.value = config.phaseDriftRate * (1 + i * 0.1); // Slightly different rates
      
      const phaseLFOGain = this.audioContext.createGain();
      phaseLFOGain.gain.value = config.phaseDriftDepth * baseFreq * 0.01; // Small frequency drift

      // Amplitude variation LFO
      const ampLFO = this.audioContext.createOscillator();
      ampLFO.type = 'sine';
      ampLFO.frequency.value = config.phaseDriftRate * 0.5 * (1 + i * 0.15);
      
      const ampLFOGain = this.audioContext.createGain();
      ampLFOGain.gain.value = config.amplitudeVariation * normalizedGain * 0.25;

      // Connect phase drift: phaseLFO -> phaseLFOGain -> osc.frequency
      phaseLFO.connect(phaseLFOGain);
      phaseLFOGain.connect(osc.frequency);

      // Connect amplitude variation: ampLFO -> ampLFOGain -> gain.gain
      ampLFO.connect(ampLFOGain);
      ampLFOGain.connect(gain.gain);

      // Connect oscillator: osc -> gain -> inputNode
      osc.connect(gain);
      const inputNode = this.getInputNode();
      if (inputNode) {
        gain.connect(inputNode);
      }

      // Store references
      this.oscillators.push(osc);
      this.oscillatorGains.push(gain);
      this.phaseDriftLFOs.push(phaseLFO);
      this.phaseDriftGains.push(phaseLFOGain);
      this.ampVariationLFOs.push(ampLFO);
      this.ampVariationGains.push(ampLFOGain);
    }

    this.metrics.activeNodes = count * 6; // Each voice has 6 nodes
  }

  protected onStart(): void {
    if (!this.audioContext) return;

    // Start all oscillators and LFOs
    const now = this.audioContext.currentTime;
    
    this.oscillators.forEach(osc => osc.start(now));
    this.phaseDriftLFOs.forEach(lfo => lfo.start(now));
    this.ampVariationLFOs.forEach(lfo => lfo.start(now));
  }

  protected onStop(): void {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Stop all oscillators and LFOs
    this.oscillators.forEach(osc => {
      try {
        osc.stop(now);
      } catch {
        // Ignore if already stopped
      }
    });

    this.phaseDriftLFOs.forEach(lfo => {
      try {
        lfo.stop(now);
      } catch {
        // Ignore if already stopped
      }
    });

    this.ampVariationLFOs.forEach(lfo => {
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

    this.phaseDriftLFOs.forEach(lfo => {
      try {
        lfo.disconnect();
      } catch {
        // Ignore disconnection errors
      }
    });

    this.phaseDriftGains.forEach(gain => {
      try {
        gain.disconnect();
      } catch {
        // Ignore disconnection errors
      }
    });

    this.ampVariationLFOs.forEach(lfo => {
      try {
        lfo.disconnect();
      } catch {
        // Ignore disconnection errors
      }
    });

    this.ampVariationGains.forEach(gain => {
      try {
        gain.disconnect();
      } catch {
        // Ignore disconnection errors
      }
    });

    // Clear arrays
    this.oscillators = [];
    this.oscillatorGains = [];
    this.phaseDriftLFOs = [];
    this.phaseDriftGains = [];
    this.ampVariationLFOs = [];
    this.ampVariationGains = [];

    this.metrics.activeNodes = 0;
  }

  protected onConfigUpdate(config: Partial<AudioModuleConfig>): void {
    if (!this.audioContext) return;

    const fullConfig = this.config as AdditiveDroneConfig;
    const now = this.audioContext.currentTime;

    // Update oscillator gains if changed
    if (config.oscillatorGains || config.amplitudeVariation) {
      this.oscillatorGains.forEach((gain, i) => {
        const normalizedGain = fullConfig.oscillatorGains[i] || (1.0 / (i + 1));
        gain.gain.setTargetAtTime(normalizedGain * 0.25, now, 0.1);
      });
    }

    // Update phase drift depth
    if (config.phaseDriftDepth) {
      this.phaseDriftGains.forEach((gain, i) => {
        const baseFreq = fullConfig.fundamentalFreq * fullConfig.harmonicRatios[i];
        gain.gain.setTargetAtTime(fullConfig.phaseDriftDepth * baseFreq * 0.01, now, 0.1);
      });
    }

    // Update amplitude variation depth
    if (config.amplitudeVariation) {
      this.ampVariationGains.forEach((gain, i) => {
        const normalizedGain = fullConfig.oscillatorGains[i] || (1.0 / (i + 1));
        gain.gain.setTargetAtTime(fullConfig.amplitudeVariation * normalizedGain * 0.25, now, 0.1);
      });
    }
  }
}
