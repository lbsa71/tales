/**
 * Successor Module (Non-representable Intelligence)
 * 
 * Rung 9: The Successor (beyond comprehension)
 * Visual: Alien, uncanny patterns with glitches and instability
 * 
 * Algorithm: Hyperbolic tiling / Penrose quasicrystal patterns
 * Creates geometrically complex, non-repeating patterns that feel
 * fundamentally alien and incomprehensible. Introduces subtle glitches
 * and dissolves at the end of the chapter.
 */

import { BaseVisualModule } from '../BaseVisualModule';
import type { VisualModuleConfig } from '../VisualModuleTypes';
import type { InteractionEvent } from '../InteractionTypes';

/**
 * Successor Module specific configuration
 */
export interface SuccessorConfig extends VisualModuleConfig {
  algorithm: 'hyperbolic' | 'quasicrystal' | 'higherDimCA';
  instabilityFactor: number;
  dissolveTime: number;
  rotationSpeed: number;
  scaleSpeed: number;
  glitchFrequency: number;
  glitchIntensity: number;
  tilingDensity: number;
  colorShiftSpeed: number;
}

/**
 * 2D Point
 */
interface Point2D {
  x: number;
  y: number;
}

/**
 * Penrose rhombus for quasicrystal tiling
 */
interface PenroseRhombus {
  center: Point2D;
  angle: number;
  size: number;
  type: 'thin' | 'thick';
  generation: number;
}

export class SuccessorModule extends BaseVisualModule {
  private tiles: PenroseRhombus[] = [];
  private rotation: number = 0;
  private scale: number = 1.0;
  private glitchTimer: number = 0;
  private glitchActive: boolean = false;
  private glitchDuration: number = 0;
  private glitchDurationTarget: number = 0;
  private glitchOffset: Point2D = { x: 0, y: 0 };
  private colorPhase: number = 0;
  private dissolvePhase: number = 0;
  private timeAlive: number = 0;

  protected getDefaultConfig(): SuccessorConfig {
    return {
      primaryColor: '#5c5cc8',
      secondaryColor: '#3d3d8b',
      accentColor: '#9d00ff',
      opacity: 0.25,
      speed: 0.2,
      density: 0.5,
      complexity: 0.9,
      algorithm: 'quasicrystal',
      instabilityFactor: 0.15,
      dissolveTime: 8000,
      rotationSpeed: 0.02,
      scaleSpeed: 0.01,
      glitchFrequency: 5000,
      glitchIntensity: 0.3,
      tilingDensity: 0.6,
      colorShiftSpeed: 0.5,
    };
  }

  protected onInit(): void {
    this.initializePattern();
  }

  /**
   * Initialize the successor pattern
   */
  private initializePattern(): void {
    const config = this.config as SuccessorConfig;

    if (config.algorithm === 'quasicrystal') {
      this.initializePenroseTiling();
    }

    this.rotation = Math.random() * Math.PI * 2;
    this.scale = 1.0;
    this.glitchTimer = 0;
    this.glitchActive = false;
    this.colorPhase = 0;
    this.dissolvePhase = 0;
    this.timeAlive = 0;
  }

  /**
   * Initialize Penrose tiling (quasicrystal pattern)
   */
  private initializePenroseTiling(): void {
    const { width, height } = this.getCanvasSize();
    const config = this.config as SuccessorConfig;

    this.tiles = [];

    // Create initial set of tiles radiating from center
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.max(width, height) * 0.7;
    const baseSize = 40 * config.tilingDensity;

    // Golden ratio for Penrose tiling
    const phi = (1 + Math.sqrt(5)) / 2;

    // Create tiles in a quasi-periodic pattern
    for (let ring = 0; ring < 8; ring++) {
      const tilesInRing = Math.floor(10 * Math.pow(phi, ring * 0.3));
      const ringRadius = (ring + 1) * baseSize;

      for (let i = 0; i < tilesInRing; i++) {
        const angle = (i / tilesInRing) * Math.PI * 2 + ring * 0.618; // Golden angle
        const x = centerX + Math.cos(angle) * ringRadius;
        const y = centerY + Math.sin(angle) * ringRadius;

        if (this.isInBounds(x, y, width, height, maxRadius)) {
          // Alternate between thin and thick rhombi
          const type = Math.random() > 0.5 ? 'thin' : 'thick';

          this.tiles.push({
            center: { x, y },
            angle: angle + Math.random() * 0.1,
            size: baseSize * (0.8 + Math.random() * 0.4),
            type,
            generation: ring,
          });
        }
      }
    }
  }

  /**
   * Check if point is within rendering bounds
   */
  private isInBounds(x: number, y: number, width: number, height: number, maxRadius: number): boolean {
    const centerX = width / 2;
    const centerY = height / 2;
    const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    return dist < maxRadius;
  }

  protected onUpdate(deltaTime: number): void {
    const config = this.config as SuccessorConfig;

    this.timeAlive += deltaTime;

    // Slow rotation
    this.rotation += config.rotationSpeed * config.speed * 0.001 * deltaTime;

    // Subtle scale pulsing
    this.scale = 1.0 + Math.sin(this.timeAlive * config.scaleSpeed * 0.001) * 0.05;

    // Color shifting
    this.colorPhase += config.colorShiftSpeed * 0.001 * deltaTime;

    // Glitch timing
    this.glitchTimer += deltaTime;
    
    // Update glitch duration if active
    if (this.glitchActive) {
      this.glitchDuration += deltaTime;
      if (this.glitchDuration >= this.glitchDurationTarget) {
        this.glitchActive = false;
        this.glitchDuration = 0;
        this.glitchOffset = { x: 0, y: 0 };
      }
    }
    
    // Start new glitch
    if (this.glitchTimer >= config.glitchFrequency) {
      this.glitchTimer = 0;
      this.glitchActive = true;
      this.glitchDuration = 0;
      this.glitchDurationTarget = 50 + Math.random() * 100;
      this.glitchOffset = {
        x: (Math.random() - 0.5) * 20 * config.glitchIntensity,
        y: (Math.random() - 0.5) * 20 * config.glitchIntensity,
      };
    }

    // Instability - random tile mutations
    if (Math.random() < config.instabilityFactor * 0.01) {
      const randomTile = this.tiles[Math.floor(Math.random() * this.tiles.length)];
      if (randomTile) {
        randomTile.angle += (Math.random() - 0.5) * 0.1;
        randomTile.size *= 0.95 + Math.random() * 0.1;
      }
    }

    // Dissolve phase (not implemented in this context as chapter end is handled externally)
    // But we can make it gradually more unstable over time
    if (this.timeAlive > 30000) {
      this.dissolvePhase = Math.min(1, (this.timeAlive - 30000) / config.dissolveTime);
    }
  }

  protected onRender(): void {
    if (!this.ctx) return;

    const config = this.config as SuccessorConfig;
    const { width, height } = this.getCanvasSize();

    // Clear canvas
    this.clearCanvas();

    // Apply global opacity with dissolve
    const dissolveOpacity = 1 - this.dissolvePhase * 0.7;
    this.ctx.globalAlpha = config.opacity * dissolveOpacity;

    this.ctx.save();

    // Center transform
    this.ctx.translate(width / 2, height / 2);
    this.ctx.rotate(this.rotation);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.translate(-width / 2, -height / 2);

    // Apply glitch offset
    if (this.glitchActive) {
      this.ctx.translate(this.glitchOffset.x, this.glitchOffset.y);
    }

    // Render pattern based on algorithm
    if (config.algorithm === 'quasicrystal') {
      this.renderPenroseTiling();
    }

    this.ctx.restore();

    // Render glitch artifacts
    if (this.glitchActive) {
      this.renderGlitchArtifacts();
    }

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Render Penrose quasicrystal tiling
   */
  private renderPenroseTiling(): void {
    if (!this.ctx) return;

    for (const tile of this.tiles) {
      this.ctx.save();

      // Color cycling based on generation and time
      const hueShift = (tile.generation * 0.1 + this.colorPhase) % 1;
      const alpha = 0.3 + Math.sin(this.colorPhase + tile.generation) * 0.2;

      this.ctx.globalAlpha *= alpha * (1 - this.dissolvePhase * 0.5);

      // Draw rhombus
      this.drawRhombus(tile, hueShift);

      this.ctx.restore();
    }
  }

  /**
   * Draw a single Penrose rhombus
   */
  private drawRhombus(tile: PenroseRhombus, hueShift: number): void {
    if (!this.ctx) return;

    const config = this.config as SuccessorConfig;

    // Rhombus angles
    const thinAngle = 36 * (Math.PI / 180); // 36 degrees
    const thickAngle = 72 * (Math.PI / 180); // 72 degrees
    const angle = tile.type === 'thin' ? thinAngle : thickAngle;

    // Calculate vertices
    const halfSize = tile.size / 2;
    const vertices: Point2D[] = [];

    for (let i = 0; i < 4; i++) {
      const a = tile.angle + (i * Math.PI / 2) + (i % 2 === 0 ? 0 : angle - Math.PI / 2);
      const r = i % 2 === 0 ? halfSize : halfSize / Math.cos(angle / 2);
      vertices.push({
        x: tile.center.x + Math.cos(a) * r,
        y: tile.center.y + Math.sin(a) * r,
      });
    }

    // Interpolate color based on hue shift
    const primaryRGB = this.hexToRgb(config.primaryColor);
    const accentRGB = this.hexToRgb(config.accentColor);

    const t = Math.abs(Math.sin(hueShift * Math.PI * 2));
    const r = Math.floor(primaryRGB.r + (accentRGB.r - primaryRGB.r) * t);
    const g = Math.floor(primaryRGB.g + (accentRGB.g - primaryRGB.g) * t);
    const b = Math.floor(primaryRGB.b + (accentRGB.b - primaryRGB.b) * t);

    // Draw filled rhombus
    this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    this.ctx.beginPath();
    this.ctx.moveTo(vertices[0].x, vertices[0].y);
    for (let i = 1; i < vertices.length; i++) {
      this.ctx.lineTo(vertices[i].x, vertices[i].y);
    }
    this.ctx.closePath();
    this.ctx.fill();

    // Draw outline
    this.ctx.strokeStyle = config.accentColor;
    this.ctx.lineWidth = 0.5;
    this.ctx.globalAlpha *= 0.5;
    this.ctx.stroke();
  }

  /**
   * Render glitch visual artifacts
   */
  private renderGlitchArtifacts(): void {
    if (!this.ctx) return;

    const config = this.config as SuccessorConfig;
    const { width, height } = this.getCanvasSize();

    this.ctx.save();
    this.ctx.globalAlpha = config.glitchIntensity * 0.5;

    // Random horizontal lines
    for (let i = 0; i < 5; i++) {
      const y = Math.random() * height;
      const lineHeight = 1 + Math.random() * 3;

      this.ctx.fillStyle = config.accentColor;
      this.ctx.fillRect(0, y, width, lineHeight);
    }

    // Random color blocks
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const w = 20 + Math.random() * 50;
      const h = 20 + Math.random() * 50;

      this.ctx.fillStyle = Math.random() > 0.5 ? config.primaryColor : config.accentColor;
      this.ctx.fillRect(x, y, w, h);
    }

    this.ctx.restore();
  }

  protected onDestroy(): void {
    this.tiles = [];
  }

  protected onConfigUpdate(_config: Partial<VisualModuleConfig>): void {
    this.initializePattern();
  }

  protected onReset(): void {
    this.initializePattern();
  }

  protected onResize(_width: number, _height: number): void {
    this.initializePattern();
  }

  // Helper: Convert hex color to RGB
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  /**
   * Handle user interactions - increase instability and glitching
   */
  protected onInteraction(event: InteractionEvent): void {
    if (event.type === 'tap' || event.type === 'pointerdown' || event.type === 'drag') {
      const config = this.config as SuccessorConfig;
      
      // Increase glitch intensity and frequency
      config.glitchIntensity = Math.min(1.0, config.glitchIntensity + 0.1);
      config.glitchFrequency = Math.min(0.5, config.glitchFrequency + 0.05);
      config.instabilityFactor = Math.min(1.0, config.instabilityFactor + 0.05);
      
      // Trigger immediate glitch
      this.glitchTimer = 0;
      
      // Update configuration
      this.updateConfig(config);
      
      // Emit event (though this module represents the unknowable, so the event itself might be corrupted)
      this.emitEvent({
        type: 'pattern-emerged',
        timestamp: event.timestamp,
        data: { 
          instability: config.instabilityFactor,
          glitchIntensity: config.glitchIntensity,
        },
      });
    }
  }
}
