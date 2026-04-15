/**
 * Base Visual Module
 * 
 * Abstract base class providing common functionality for all visual modules.
 * Handles canvas management, animation loop, and lifecycle methods.
 */

import type { VisualModule, VisualModuleConfig, ModuleState, PerformanceMetrics } from './VisualModuleTypes';
import type { VisualModuleEvent } from './VisualModuleEvents';
import type { InteractionEvent, InteractionState, InteractionPoint } from './InteractionTypes';

export abstract class BaseVisualModule implements VisualModule {
  protected canvas: HTMLCanvasElement | null = null;
  protected ctx: CanvasRenderingContext2D | null = null;
  protected config: VisualModuleConfig;
  protected state: ModuleState = 'uninitialized';
  protected isPaused: boolean = false;
  protected animationFrameId: number | null = null;
  protected lastFrameTime: number = 0;
  protected metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    lastUpdateTime: 0,
  };
  
  // Event emitter callback
  private eventEmitter: ((event: VisualModuleEvent) => void) | null = null;

  // Interaction state
  protected interactionState: InteractionState = {
    isActive: false,
    currentPoint: null,
    lastPoint: null,
    startPoint: null,
    startTime: 0,
    isDragging: false,
    velocity: { x: 0, y: 0 },
  };

  // Event listeners for cleanup
  private boundPointerDown: ((e: PointerEvent) => void) | null = null;
  private boundPointerMove: ((e: PointerEvent) => void) | null = null;
  private boundPointerUp: ((e: PointerEvent) => void) | null = null;
  private boundPointerLeave: ((e: PointerEvent) => void) | null = null;

  constructor(config?: VisualModuleConfig) {
    this.config = config || this.getDefaultConfig();
  }

  /**
   * Initialize the module with a canvas element
   */
  init(canvas: HTMLCanvasElement, config: VisualModuleConfig): void {
    if (this.state !== 'uninitialized' && this.state !== 'destroyed') {
      console.warn('Module already initialized');
      return;
    }

    this.state = 'initializing';
    this.canvas = canvas;
    this.config = { ...this.config, ...config };
    
    // Get 2D context
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      throw new Error('Failed to get 2D canvas context');
    }
    this.ctx = ctx;

    // Set canvas size to match display size with device pixel ratio
    this.resizeCanvas();

    // Setup resize observer
    this.setupResizeObserver();

    // Setup interaction listeners
    this.setupInteractionListeners();

    // Module-specific initialization
    this.onInit();

    this.state = 'running';
  }

  /**
   * Update module state (called each frame)
   */
  update(deltaTime: number): void {
    if (this.state !== 'running' || this.isPaused) {
      return;
    }

    // Update performance metrics
    const now = performance.now();
    if (this.metrics.lastUpdateTime > 0) {
      const frameDelta = now - this.metrics.lastUpdateTime;
      this.metrics.frameTime = frameDelta;
      this.metrics.fps = Math.round(1000 / frameDelta);
    }
    this.metrics.lastUpdateTime = now;

    // Module-specific update
    this.onUpdate(deltaTime);
  }

  /**
   * Render the module to canvas
   */
  render(): void {
    if (this.state !== 'running' || !this.ctx || !this.canvas) {
      return;
    }

    // Module-specific rendering
    this.onRender();
  }

  /**
   * Clean up resources and destroy the module
   */
  destroy(): void {
    if (this.state === 'destroyed') {
      return;
    }

    // Cancel any animation frames
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Remove interaction listeners
    this.removeInteractionListeners();

    // Module-specific cleanup
    this.onDestroy();

    // Clear canvas
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Reset references
    this.canvas = null;
    this.ctx = null;
    this.state = 'destroyed';
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VisualModuleConfig>): void {
    this.config = { ...this.config, ...config };
    this.onConfigUpdate(config);
  }

  /**
   * Get current configuration
   */
  getConfig(): VisualModuleConfig {
    return { ...this.config };
  }

  /**
   * Pause the module
   */
  pause(): void {
    this.isPaused = true;
    this.state = 'paused';
  }

  /**
   * Resume the module
   */
  resume(): void {
    if (this.state === 'paused') {
      this.isPaused = false;
      this.state = 'running';
    }
  }

  /**
   * Reset the module to initial state
   */
  reset(): void {
    this.onReset();
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Resize canvas to match display size
   */
  protected resizeCanvas(): void {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set actual size in pixels
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    // Scale context to ensure correct drawing
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }

    // Notify subclass of resize
    this.onResize(rect.width, rect.height);
  }

  /**
   * Setup resize observer to handle window resizing
   */
  private setupResizeObserver(): void {
    if (!this.canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });

    resizeObserver.observe(this.canvas);
  }

  /**
   * Clear the entire canvas
   */
  protected clearCanvas(alpha: number = 1): void {
    if (!this.ctx || !this.canvas) return;

    if (alpha >= 1) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      // Partially clear for trail effects
      this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Get canvas dimensions (logical, not physical pixels)
   */
  protected getCanvasSize(): { width: number; height: number } {
    if (!this.canvas) {
      return { width: 0, height: 0 };
    }
    const rect = this.canvas.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  // Abstract methods that subclasses must implement

  /**
   * Get default configuration for this module
   */
  protected abstract getDefaultConfig(): VisualModuleConfig;

  /**
   * Module-specific initialization
   */
  protected abstract onInit(): void;

  /**
   * Module-specific update logic
   */
  protected abstract onUpdate(deltaTime: number): void;

  /**
   * Module-specific rendering logic
   */
  protected abstract onRender(): void;

  /**
   * Module-specific cleanup
   */
  protected abstract onDestroy(): void;

  /**
   * Handle configuration updates
   */
  protected abstract onConfigUpdate(config: Partial<VisualModuleConfig>): void;

  /**
   * Handle reset
   */
  protected abstract onReset(): void;

  /**
   * Handle canvas resize
   */
  protected abstract onResize(width: number, height: number): void;

  /**
   * Set the event emitter callback (called by orchestrator)
   */
  setEventEmitter(emitter: (event: VisualModuleEvent) => void): void {
    this.eventEmitter = emitter;
  }

  /**
   * Emit an event (to be forwarded by orchestrator to audio modules)
   */
  protected emitEvent(event: VisualModuleEvent): void {
    if (this.eventEmitter) {
      this.eventEmitter(event);
    }
  }

  /**
   * Setup interaction event listeners
   */
  private setupInteractionListeners(): void {
    if (!this.canvas) return;

    // Make canvas interactive
    this.canvas.style.pointerEvents = 'auto';

    // Create bound methods for cleanup
    this.boundPointerDown = this.handlePointerDown.bind(this);
    this.boundPointerMove = this.handlePointerMove.bind(this);
    this.boundPointerUp = this.handlePointerUp.bind(this);
    this.boundPointerLeave = this.handlePointerLeave.bind(this);

    // Add event listeners
    this.canvas.addEventListener('pointerdown', this.boundPointerDown);
    this.canvas.addEventListener('pointermove', this.boundPointerMove);
    this.canvas.addEventListener('pointerup', this.boundPointerUp);
    this.canvas.addEventListener('pointerleave', this.boundPointerLeave);
  }

  /**
   * Remove interaction event listeners
   */
  private removeInteractionListeners(): void {
    if (!this.canvas) return;

    if (this.boundPointerDown) {
      this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
    }
    if (this.boundPointerMove) {
      this.canvas.removeEventListener('pointermove', this.boundPointerMove);
    }
    if (this.boundPointerUp) {
      this.canvas.removeEventListener('pointerup', this.boundPointerUp);
    }
    if (this.boundPointerLeave) {
      this.canvas.removeEventListener('pointerleave', this.boundPointerLeave);
    }

    this.boundPointerDown = null;
    this.boundPointerMove = null;
    this.boundPointerUp = null;
    this.boundPointerLeave = null;
  }

  /**
   * Convert screen coordinates to canvas coordinates
   */
  private screenToCanvasCoords(clientX: number, clientY: number): InteractionPoint {
    if (!this.canvas) {
      return { x: 0, y: 0 };
    }

    const rect = this.canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  /**
   * Public method to handle interactions from external sources (e.g., content-container)
   * Converts screen coordinates to canvas coordinates and triggers the interaction
   */
  public handleInteraction(clientX: number, clientY: number, type: InteractionEvent['type'] = 'tap'): void {
    if (!this.canvas) return;

    const point = this.screenToCanvasCoords(clientX, clientY);
    const now = performance.now();

    const interactionEvent: InteractionEvent = {
      type,
      point,
      timestamp: now,
      isTouch: false, // Assume mouse for external calls
      velocity: { x: 0, y: 0 },
    };

    this.onInteraction(interactionEvent);
  }

  /**
   * Handle pointer down event
   */
  private handlePointerDown(e: PointerEvent): void {
    if (!this.canvas) return;

    const point = this.screenToCanvasCoords(e.clientX, e.clientY);
    const now = performance.now();

    this.interactionState.isActive = true;
    this.interactionState.currentPoint = point;
    this.interactionState.startPoint = point;
    this.interactionState.lastPoint = point;
    this.interactionState.startTime = now;
    this.interactionState.isDragging = false;

    const interactionEvent: InteractionEvent = {
      type: 'pointerdown',
      point,
      timestamp: now,
      isTouch: e.pointerType === 'touch',
      velocity: { x: 0, y: 0 },
    };

    this.onInteraction(interactionEvent);
  }

  /**
   * Handle pointer move event
   */
  private handlePointerMove(e: PointerEvent): void {
    if (!this.canvas) return;

    const point = this.screenToCanvasCoords(e.clientX, e.clientY);
    const now = performance.now();

    const lastPoint = this.interactionState.currentPoint || point;
    
    // Calculate velocity
    const timeDelta = now - (this.interactionState.startTime || now);
    const velocity = {
      x: timeDelta > 0 ? (point.x - lastPoint.x) / timeDelta * 1000 : 0,
      y: timeDelta > 0 ? (point.y - lastPoint.y) / timeDelta * 1000 : 0,
    };

    this.interactionState.lastPoint = this.interactionState.currentPoint;
    this.interactionState.currentPoint = point;
    this.interactionState.velocity = velocity;

    if (this.interactionState.isActive) {
      this.interactionState.isDragging = true;

      const interactionEvent: InteractionEvent = {
        type: 'drag',
        point,
        timestamp: now,
        isTouch: e.pointerType === 'touch',
        velocity,
      };

      this.onInteraction(interactionEvent);
    } else {
      const interactionEvent: InteractionEvent = {
        type: 'hover',
        point,
        timestamp: now,
        isTouch: false,
        velocity,
      };

      this.onInteraction(interactionEvent);
    }
  }

  /**
   * Handle pointer up event
   */
  private handlePointerUp(e: PointerEvent): void {
    if (!this.canvas) return;

    const point = this.screenToCanvasCoords(e.clientX, e.clientY);
    const now = performance.now();

    const wasDragging = this.interactionState.isDragging;
    const timeSinceStart = now - this.interactionState.startTime;

    // Detect tap (quick press and release without much movement)
    const isTap = !wasDragging && timeSinceStart < 300;

    const interactionEvent: InteractionEvent = {
      type: isTap ? 'tap' : 'pointerup',
      point,
      timestamp: now,
      isTouch: e.pointerType === 'touch',
      velocity: this.interactionState.velocity,
    };

    this.onInteraction(interactionEvent);

    // Reset interaction state
    this.interactionState.isActive = false;
    this.interactionState.isDragging = false;
    this.interactionState.startPoint = null;
  }

  /**
   * Handle pointer leave event
   */
  private handlePointerLeave(e: PointerEvent): void {
    if (!this.canvas || !this.interactionState.isActive) return;

    const point = this.screenToCanvasCoords(e.clientX, e.clientY);
    const now = performance.now();

    const interactionEvent: InteractionEvent = {
      type: 'pointerup',
      point,
      timestamp: now,
      isTouch: e.pointerType === 'touch',
      velocity: this.interactionState.velocity,
    };

    this.onInteraction(interactionEvent);

    // Reset interaction state
    this.interactionState.isActive = false;
    this.interactionState.isDragging = false;
    this.interactionState.currentPoint = null;
    this.interactionState.lastPoint = null;
    this.interactionState.startPoint = null;
  }

  /**
   * Handle interaction events (to be overridden by subclasses)
   * Default implementation does nothing
   */
  protected onInteraction(_event: InteractionEvent): void {
    // Subclasses can override this to respond to interactions
  }
}
