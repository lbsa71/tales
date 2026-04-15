/**
 * Visual Module Orchestrator
 * 
 * Manages the lifecycle of visual modules, including loading, unloading,
 * and smooth transitions between modules as chapters change.
 */

import type { VisualModule, VisualConfig, ModuleConfigEntry } from './VisualModuleTypes';
import type { VisualModuleEvent } from './VisualModuleEvents';
import { DLAModule } from './modules/DLAModule';
import { ReactionDiffusionModule } from './modules/ReactionDiffusionModule';
import { LSystemModule } from './modules/LSystemModule';
import { CellularAutomataModule } from './modules/CellularAutomataModule';
import { MorphogeneticModule } from './modules/MorphogeneticModule';
import { BoidsModule } from './modules/BoidsModule';
import { ForceDirectedGraphModule } from './modules/ForceDirectedGraphModule';
import { NeuralActivationModule } from './modules/NeuralActivationModule';
import { SuccessorModule } from './modules/SuccessorModule';
import { BaseVisualModule } from './BaseVisualModule';

export class VisualModuleOrchestrator {
  private canvas: HTMLCanvasElement;
  private config: VisualConfig;
  private currentModule: VisualModule | null = null;
  private currentChapterId: number | null = null;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private isTransitioning: boolean = false;
  private eventListener: ((event: VisualModuleEvent) => void) | null = null;

  constructor(canvas: HTMLCanvasElement, config: VisualConfig) {
    this.canvas = canvas;
    this.config = config;
  }

  /**
   * Load and start a module for a specific chapter
   */
  async loadChapter(chapterId: number): Promise<void> {
    // Find module configuration for this chapter
    const moduleConfig = this.config.modules.find(m => m.chapterId === chapterId);
    
    if (!moduleConfig || !moduleConfig.enabled) {
      console.warn(`No module configured for chapter ${chapterId}`);
      return;
    }

    // If already showing this chapter, do nothing
    if (this.currentChapterId === chapterId) {
      return;
    }

    // Unload current module if any
    if (this.currentModule) {
      this.unloadCurrentModule();
    }

    // Create new module instance
    const module = this.createModule(moduleConfig);
    if (!module) {
      console.error(`Failed to create module: ${moduleConfig.moduleName}`);
      return;
    }

    // Initialize module
    try {
      console.log('[VisualModuleOrchestrator] Initializing module:', moduleConfig.moduleName, 'with config:', moduleConfig.config);
      module.init(this.canvas, moduleConfig.config);
      
      // Set up event emitter for the module
      if (module instanceof BaseVisualModule) {
        module.setEventEmitter((event: VisualModuleEvent) => {
          // Add chapter ID to event
          const eventWithChapter: VisualModuleEvent = {
            ...event,
            chapterId: chapterId,
          };
          this.handleModuleEvent(eventWithChapter);
        });
      }
      
      this.currentModule = module;
      this.currentChapterId = chapterId;
      console.log('[VisualModuleOrchestrator] Module initialized successfully');

      // Start animation loop if not already running
      if (this.animationFrameId === null) {
        console.log('[VisualModuleOrchestrator] Starting animation loop');
        this.startAnimationLoop();
      }
    } catch (error) {
      console.error('[VisualModuleOrchestrator] Failed to initialize module:', error);
    }
  }

  /**
   * Transition to a new chapter module
   */
  async transitionTo(chapterId: number): Promise<void> {
    if (this.isTransitioning) {
      return;
    }

    this.isTransitioning = true;

    // Fade out current module
    if (this.currentModule) {
      await this.fadeOut(this.config.transitions.duration / 2);
    }

    // Load new module
    await this.loadChapter(chapterId);

    // Fade in new module
    if (this.currentModule) {
      await this.fadeIn(this.config.transitions.duration / 2);
    }

    this.isTransitioning = false;
  }

  /**
   * Pause current module
   */
  pause(): void {
    if (this.currentModule) {
      this.currentModule.pause();
    }
  }

  /**
   * Resume current module
   */
  resume(): void {
    if (this.currentModule) {
      this.currentModule.resume();
    }
  }

  /**
   * Destroy orchestrator and clean up
   */
  destroy(): void {
    // Stop animation loop
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Unload current module
    this.unloadCurrentModule();
  }

  /**
   * Get current module (for debugging/testing)
   */
  getCurrentModule(): VisualModule | null {
    return this.currentModule;
  }

  /**
   * Set event listener for forwarding events to audio modules
   */
  setEventListener(listener: (event: VisualModuleEvent) => void): void {
    this.eventListener = listener;
  }

  /**
   * Handle events from visual modules
   */
  private handleModuleEvent(event: VisualModuleEvent): void {
    if (this.eventListener) {
      this.eventListener(event);
    }
  }

  /**
   * Create module instance based on name
   */
  private createModule(moduleConfig: ModuleConfigEntry): VisualModule | null {
    console.log('[VisualModuleOrchestrator] Creating module:', moduleConfig.moduleName, 'for chapter', moduleConfig.chapterId);
    switch (moduleConfig.moduleName) {
      case 'DLA':
        return new DLAModule();
      case 'ReactionDiffusion':
        return new ReactionDiffusionModule();
      case 'LSystem':
        return new LSystemModule();
      case 'CellularAutomata':
        return new CellularAutomataModule();
      case 'Morphogenetic':
        return new MorphogeneticModule();
      case 'Boids':
        return new BoidsModule();
      case 'ForceDirectedGraph':
        return new ForceDirectedGraphModule();
      case 'NeuralActivation':
        return new NeuralActivationModule();
      case 'Successor':
        return new SuccessorModule();
      default:
        console.warn(`[VisualModuleOrchestrator] Unknown module type: ${moduleConfig.moduleName}`);
        return null;
    }
  }

  /**
   * Unload and destroy current module
   */
  private unloadCurrentModule(): void {
    if (this.currentModule) {
      this.currentModule.destroy();
      this.currentModule = null;
      this.currentChapterId = null;
    }
  }

  /**
   * Start the animation loop
   */
  private startAnimationLoop(): void {
    this.lastFrameTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;

      if (this.currentModule) {
        this.currentModule.update(deltaTime);
        this.currentModule.render();
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Fade out current module
   */
  private fadeOut(duration: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.currentModule) {
        resolve();
        return;
      }

      const startOpacity = this.currentModule.getConfig().opacity;
      const startTime = performance.now();

      const fade = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newOpacity = startOpacity * (1 - progress);

        if (this.currentModule) {
          this.currentModule.updateConfig({ opacity: newOpacity });
        }

        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(fade);
    });
  }

  /**
   * Fade in current module
   */
  private fadeIn(duration: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.currentModule) {
        resolve();
        return;
      }

      const targetOpacity = this.currentModule.getConfig().opacity;
      const startTime = performance.now();

      // Start at 0 opacity
      this.currentModule.updateConfig({ opacity: 0 });

      const fade = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newOpacity = targetOpacity * progress;

        if (this.currentModule) {
          this.currentModule.updateConfig({ opacity: newOpacity });
        }

        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(fade);
    });
  }
}
