/**
 * Audio Module Orchestrator
 * 
 * Manages lifecycle and transitions between audio modules.
 * Handles smooth crossfading, configuration loading, and module switching.
 */

import type { AudioModule, AudioConfig, ModuleConfigEntry, PerformanceMetrics } from './AudioModuleTypes';
import type { VisualModuleEvent } from '../visualModules/VisualModuleEvents';
import { FilteredNoiseModule } from './modules/FilteredNoiseModule';
import { GranularCloudModule } from './modules/GranularCloudModule';
import { SparseFMModule } from './modules/SparseFMModule';
import { MicrosoundModule } from './modules/MicrosoundModule';
import { AdditiveDroneModule } from './modules/AdditiveDroneModule';
import { StereoShiftModule } from './modules/StereoShiftModule';
import { SyntheticChimesModule } from './modules/SyntheticChimesModule';
import { NeuralSonificationModule } from './modules/NeuralSonificationModule';
import { HyperlowRumbleModule } from './modules/HyperlowRumbleModule';
import { BaseAudioModule } from './BaseAudioModule';

export class AudioModuleOrchestrator {
  private audioContext: AudioContext;
  private config: AudioConfig;
  private currentModule: AudioModule | null = null;
  private currentChapterId: number = -1;
  private isTransitioning: boolean = false;

  // Module registry - maps module names to constructors
  private moduleRegistry: Map<string, new () => AudioModule>;

  constructor(audioContext: AudioContext, config: AudioConfig) {
    this.audioContext = audioContext;
    this.config = config;
    this.moduleRegistry = new Map();

    // Register all available modules
    this.registerModules();
  }

  /**
   * Register all audio module classes
   */
  private registerModules(): void {
    this.moduleRegistry.set('FilteredNoise', FilteredNoiseModule);
    this.moduleRegistry.set('GranularCloud', GranularCloudModule);
    this.moduleRegistry.set('SparseFM', SparseFMModule);
    this.moduleRegistry.set('Microsound', MicrosoundModule);
    this.moduleRegistry.set('AdditiveDrone', AdditiveDroneModule);
    this.moduleRegistry.set('StereoShift', StereoShiftModule);
    this.moduleRegistry.set('SyntheticChimes', SyntheticChimesModule);
    this.moduleRegistry.set('NeuralSonification', NeuralSonificationModule);
    this.moduleRegistry.set('HyperlowRumble', HyperlowRumbleModule);
  }

  /**
   * Load and start module for a specific chapter
   */
  async loadChapter(chapterId: number): Promise<void> {
    console.log('[AudioOrchestrator] loadChapter()', { chapterId, currentChapterId: this.currentChapterId });
    if (this.currentChapterId === chapterId) {
      console.warn(`Chapter ${chapterId} already loaded`);
      return;
    }

    // Resume AudioContext if suspended (critical for iOS browsers)
    await this.resumeAudioContext();

    // Find module configuration for this chapter
    const moduleConfig = this.config.modules.find(m => m.chapterId === chapterId);
    if (!moduleConfig) {
      console.warn(`[Audio] No audio module configured for chapter ${chapterId}`);
      return;
    }

    if (!moduleConfig.enabled) {
      console.log(`[Audio] Audio module for chapter ${chapterId} is disabled`);
      return;
    }

    // Stop current module if running
    if (this.currentModule) {
      this.currentModule.stop();
      this.currentModule.destroy();
      this.currentModule = null;
    }

    // Create new module
    const newModule = this.createModule(moduleConfig);
    if (!newModule) {
      console.error(`Failed to create module: ${moduleConfig.moduleName}`);
      return;
    }

    // Initialize and start
    newModule.init(this.audioContext, moduleConfig.config);
    newModule.start();
    newModule.fadeIn(this.config.transitions.duration / 1000);

    console.log(`[Audio] Module ${moduleConfig.moduleName} started for chapter ${chapterId}`, {
      masterGain: moduleConfig.config.masterGain,
      panWidth: moduleConfig.config.panWidth,
      density: (moduleConfig as any).config?.density,
      audioContextState: this.audioContext.state,
      sampleRate: this.audioContext.sampleRate,
    });
    this.currentModule = newModule;
    this.currentChapterId = chapterId;
  }

  /**
   * Transition to a different chapter with crossfade
   */
  async transitionTo(chapterId: number): Promise<void> {
    if (this.isTransitioning) {
      console.warn('Transition already in progress');
      return;
    }

    if (this.currentChapterId === chapterId) {
      return;
    }

    // Resume AudioContext if suspended (critical for iOS browsers)
    await this.resumeAudioContext();

    this.isTransitioning = true;

    const oldModule = this.currentModule;
    const fadeDuration = this.config.transitions.duration / 1000; // Convert to seconds

    // Find new module configuration
    const moduleConfig = this.config.modules.find(m => m.chapterId === chapterId);
    if (!moduleConfig || !moduleConfig.enabled) {
      // Just fade out if no module for new chapter
      if (oldModule) {
        oldModule.fadeOut(fadeDuration);
        setTimeout(() => {
          oldModule.stop();
          oldModule.destroy();
        }, fadeDuration * 1000 + 100);
      }
      this.currentModule = null;
      this.currentChapterId = chapterId;
      this.isTransitioning = false;
      return;
    }

    // Create new module
    const newModule = this.createModule(moduleConfig);
    if (!newModule) {
      console.error(`Failed to create module: ${moduleConfig.moduleName}`);
      this.isTransitioning = false;
      return;
    }

    // Initialize new module
    newModule.init(this.audioContext, moduleConfig.config);

    // Start crossfade
    newModule.start();
    newModule.fadeIn(fadeDuration);

    if (oldModule) {
      oldModule.fadeOut(fadeDuration);
    }

    // Clean up old module after fade
    setTimeout(() => {
      if (oldModule) {
        oldModule.stop();
        oldModule.destroy();
      }
      this.isTransitioning = false;
    }, fadeDuration * 1000 + 100);

    this.currentModule = newModule;
    this.currentChapterId = chapterId;
  }

  /**
   * Pause current module
   */
  pause(): void {
    if (this.currentModule) {
      console.log('[AudioOrchestrator] pause()');
      this.currentModule.pause();
    }
  }

  /**
   * Resume current module
   */
  resume(): void {
    if (this.currentModule) {
      console.log('[AudioOrchestrator] resume()');
      this.currentModule.resume();
    }
  }

  /**
   * Stop and destroy current module
   */
  stop(): void {
    if (this.currentModule) {
      console.log('[AudioOrchestrator] stop()');
      this.currentModule.stop();
      this.currentModule.destroy();
      this.currentModule = null;
      this.currentChapterId = -1;
    }
  }

  /**
   * Clean up all resources
   */
  destroy(): void {
    this.stop();
    this.moduleRegistry.clear();
  }

  /**
   * Get current module's performance metrics
   */
  getMetrics(): PerformanceMetrics | null {
    if (this.currentModule) {
      return this.currentModule.getMetrics();
    }
    return null;
  }

  /**
   * Update global configuration
   */
  updateGlobalConfig(config: Partial<AudioConfig['global']>): void {
    this.config.global = { ...this.config.global, ...config };
  }

  /**
   * Set volume for the current module (0.0 to 1.0)
   * This multiplies the base masterGain by the volume factor
   */
  setVolume(volume: number): void {
    if (!this.currentModule) {
      return;
    }

    // Get the base masterGain from config
    const moduleConfig = this.config.modules.find(m => m.chapterId === this.currentChapterId);
    if (!moduleConfig) {
      return;
    }

    const baseGain = moduleConfig.config.masterGain || 0.3;
    const effectiveGain = baseGain * volume;

    // Update the current module's config with the new gain
    this.currentModule.updateConfig({ masterGain: effectiveGain });
    console.log(`[Audio] Volume set to ${(volume * 100).toFixed(0)}% (gain: ${effectiveGain.toFixed(3)})`);
  }

  /**
   * Get current chapter ID
   */
  getCurrentChapterId(): number {
    return this.currentChapterId;
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.currentModule !== null && this.currentModule.getState() === 'running';
  }

  /**
   * Create a module instance from configuration
   */
  private createModule(moduleConfig: ModuleConfigEntry): AudioModule | null {
    const ModuleClass = this.moduleRegistry.get(moduleConfig.moduleName);
    if (!ModuleClass) {
      console.error(`Module class not found: ${moduleConfig.moduleName}`);
      return null;
    }

    return new ModuleClass();
  }

  /**
   * Get AudioContext
   */
  getAudioContext(): AudioContext {
    return this.audioContext;
  }

  /**
   * Resume AudioContext if suspended or interrupted (for browser autoplay policies)
   * On iOS, the AudioContext can enter 'interrupted' state in addition to 'suspended'
   */
  async resumeAudioContext(): Promise<void> {
    if (this.audioContext.state === 'suspended' || this.audioContext.state === 'interrupted') {
      console.log('[AudioOrchestrator] resumeAudioContext() - resuming', { state: this.audioContext.state });
      await this.audioContext.resume();
      console.log('[AudioOrchestrator] resumeAudioContext() - resumed', { newState: this.audioContext.state });
    } else {
      console.log('[AudioOrchestrator] resumeAudioContext() - already running', { state: this.audioContext.state });
    }
  }

  /**
   * Handle events from visual modules
   */
  handleVisualEvent(event: VisualModuleEvent): void {
    // Only forward events if they're for the current chapter
    if (event.chapterId && event.chapterId !== this.currentChapterId) {
      return;
    }

    // Forward event to current audio module
    if (this.currentModule && this.currentModule instanceof BaseAudioModule) {
      this.currentModule.handleVisualEvent(event);
    }
  }
}
