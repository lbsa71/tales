/**
 * Base Audio Module
 * 
 * Abstract base class providing common functionality for all audio modules.
 * Handles AudioContext management, gain control, filtering, and lifecycle methods.
 */

import type { AudioModule, AudioModuleConfig, ModuleState, PerformanceMetrics } from './AudioModuleTypes';
import type { VisualModuleEvent } from '../visualModules/VisualModuleEvents';

export abstract class BaseAudioModule implements AudioModule {
  protected audioContext: AudioContext | null = null;
  protected config: AudioModuleConfig;
  protected state: ModuleState = 'uninitialized';
  
  // Core audio nodes shared by all modules
  protected outputGain: GainNode | null = null;
  protected lowPassFilter: BiquadFilterNode | null = null;
  protected highPassFilter: BiquadFilterNode | null = null;
  protected stereoPanner: StereoPannerNode | null = null;
  
  // Performance tracking
  protected metrics: PerformanceMetrics = {
    activeNodes: 0,
    lastUpdateTime: 0,
  };

  constructor(config?: AudioModuleConfig) {
    this.config = config || this.getDefaultConfig();
  }

  /**
   * Initialize the module with an AudioContext
   */
  init(audioContext: AudioContext, config: AudioModuleConfig): void {
    if (this.state !== 'uninitialized' && this.state !== 'destroyed') {
      console.warn('Module already initialized');
      return;
    }

    this.state = 'initializing';
    this.audioContext = audioContext;
    this.config = { ...this.config, ...config };

    // Create core audio nodes
    this.setupCoreNodes();

    // Module-specific initialization
    this.onInit();

    this.state = 'stopped';
  }

  /**
   * Start audio playback
   */
  start(): void {
    if (this.state !== 'stopped' && this.state !== 'paused') {
      console.warn('Module must be stopped or paused to start');
      return;
    }

    this.state = 'running';
    this.metrics.lastUpdateTime = this.audioContext!.currentTime;

    // Module-specific start logic
    this.onStart();
  }

  /**
   * Stop audio playback
   */
  stop(): void {
    if (this.state !== 'running' && this.state !== 'paused') {
      return;
    }

    // Module-specific stop logic
    this.onStop();
    
    this.state = 'stopped';
  }

  /**
   * Pause audio playback
   */
  pause(): void {
    if (this.state !== 'running') {
      return;
    }

    this.onPause();
    this.state = 'paused';
  }

  /**
   * Resume audio playback
   */
  resume(): void {
    if (this.state !== 'paused') {
      return;
    }

    this.onResume();
    this.state = 'running';
  }

  /**
   * Fade in over specified duration
   */
  fadeIn(duration: number): void {
    if (!this.audioContext || !this.outputGain) {
      return;
    }

    const now = this.audioContext.currentTime;
    const targetGain = this.config.masterGain;

    this.outputGain.gain.cancelScheduledValues(now);
    this.outputGain.gain.setValueAtTime(0, now);
    this.outputGain.gain.linearRampToValueAtTime(targetGain, now + duration);
  }

  /**
   * Fade out over specified duration
   */
  fadeOut(duration: number): void {
    if (!this.audioContext || !this.outputGain) {
      return;
    }

    const now = this.audioContext.currentTime;
    
    this.outputGain.gain.cancelScheduledValues(now);
    this.outputGain.gain.setValueAtTime(this.outputGain.gain.value, now);
    this.outputGain.gain.linearRampToValueAtTime(0.001, now + duration);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AudioModuleConfig>): void {
    this.config = { ...this.config, ...config };

    // Update core nodes
    this.updateCoreNodes();

    // Module-specific config updates
    this.onConfigUpdate(config);
  }

  /**
   * Get current configuration
   */
  getConfig(): AudioModuleConfig {
    return { ...this.config };
  }

  /**
   * Clean up resources and destroy the module
   */
  destroy(): void {
    if (this.state === 'destroyed') {
      return;
    }

    // Stop if running
    if (this.state === 'running' || this.state === 'paused') {
      this.stop();
    }

    // Module-specific cleanup
    this.onDestroy();

    // Disconnect and clean up core nodes
    this.cleanupCoreNodes();

    this.audioContext = null;
    this.state = 'destroyed';
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get current state
   */
  getState(): ModuleState {
    return this.state;
  }

  /**
   * Setup core audio nodes (gain, filters, panning)
   */
  private setupCoreNodes(): void {
    if (!this.audioContext) return;

    // Output gain node
    this.outputGain = this.audioContext.createGain();
    this.outputGain.gain.value = this.config.masterGain;

    // High-pass filter (removes low rumble)
    this.highPassFilter = this.audioContext.createBiquadFilter();
    this.highPassFilter.type = 'highpass';
    this.highPassFilter.frequency.value = this.config.lowCutoff;
    this.highPassFilter.Q.value = 0.7;

    // Low-pass filter (removes harsh highs)
    this.lowPassFilter = this.audioContext.createBiquadFilter();
    this.lowPassFilter.type = 'lowpass';
    this.lowPassFilter.frequency.value = this.config.highCutoff;
    this.lowPassFilter.Q.value = 0.7;

    // Stereo panner
    this.stereoPanner = this.audioContext.createStereoPanner();
    this.stereoPanner.pan.value = 0;

    // Connect core chain: highPass -> lowPass -> panner -> output -> destination
    this.highPassFilter.connect(this.lowPassFilter);
    this.lowPassFilter.connect(this.stereoPanner);
    this.stereoPanner.connect(this.outputGain);
    this.outputGain.connect(this.audioContext.destination);
  }

  /**
   * Update core nodes based on config changes
   */
  private updateCoreNodes(): void {
    if (!this.audioContext) return;

    if (this.outputGain) {
      const now = this.audioContext.currentTime;
      this.outputGain.gain.setTargetAtTime(this.config.masterGain, now, 0.1);
    }

    if (this.highPassFilter) {
      this.highPassFilter.frequency.value = this.config.lowCutoff;
    }

    if (this.lowPassFilter) {
      this.lowPassFilter.frequency.value = this.config.highCutoff;
    }
  }

  /**
   * Cleanup core audio nodes
   */
  private cleanupCoreNodes(): void {
    if (this.outputGain) {
      this.outputGain.disconnect();
      this.outputGain = null;
    }

    if (this.lowPassFilter) {
      this.lowPassFilter.disconnect();
      this.lowPassFilter = null;
    }

    if (this.highPassFilter) {
      this.highPassFilter.disconnect();
      this.highPassFilter = null;
    }

    if (this.stereoPanner) {
      this.stereoPanner.disconnect();
      this.stereoPanner = null;
    }
  }

  /**
   * Get the input node for module's audio chain
   * Modules should connect their audio sources to this node
   */
  protected getInputNode(): AudioNode | null {
    return this.highPassFilter;
  }

  /**
   * Create a smooth gain envelope
   */
  protected createGainEnvelope(
    gainNode: GainNode,
    attackTime: number,
    sustainTime: number,
    releaseTime: number,
    peakGain: number
  ): void {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(peakGain, now + attackTime);
    gainNode.gain.setValueAtTime(peakGain, now + attackTime + sustainTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + attackTime + sustainTime + releaseTime);
  }

  // Abstract methods that subclasses must implement

  /**
   * Get default configuration for this module
   */
  protected abstract getDefaultConfig(): AudioModuleConfig;

  /**
   * Module-specific initialization
   */
  protected abstract onInit(): void;

  /**
   * Module-specific start logic
   */
  protected abstract onStart(): void;

  /**
   * Module-specific stop logic
   */
  protected abstract onStop(): void;

  /**
   * Module-specific pause logic (optional)
   * Default implementation mutes the output gain
   */
  protected onPause(): void {
    if (this.outputGain && this.audioContext) {
      const now = this.audioContext.currentTime;
      this.outputGain.gain.cancelScheduledValues(now);
      this.outputGain.gain.setTargetAtTime(0, now, 0.01);
    }
  }

  /**
   * Module-specific resume logic (optional)
   * Default implementation restores the output gain
   */
  protected onResume(): void {
    if (this.outputGain && this.audioContext) {
      const now = this.audioContext.currentTime;
      this.outputGain.gain.cancelScheduledValues(now);
      this.outputGain.gain.setTargetAtTime(this.config.masterGain, now, 0.01);
    }
  }

  /**
   * Module-specific cleanup
   */
  protected abstract onDestroy(): void;

  /**
   * Handle configuration updates
   */
  protected abstract onConfigUpdate(config: Partial<AudioModuleConfig>): void;

  /**
   * Handle events from visual modules (optional override)
   * Default implementation does nothing - modules can override to respond to events
   */
  handleVisualEvent(_event: VisualModuleEvent): void {
    // Default: do nothing
    // Subclasses can override to respond to specific events
  }
}
