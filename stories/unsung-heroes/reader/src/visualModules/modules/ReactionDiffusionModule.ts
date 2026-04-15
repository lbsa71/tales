/**
 * Reaction-Diffusion Module (Gray-Scott System)
 * 
 * Rung 2: Protocells
 * Visual: Slowly morphing spots and stripes representing membrane boundaries
 * 
 * Algorithm: Gray-Scott reaction-diffusion system simulating pattern formation
 * through chemical interactions. Creates organic, membrane-like patterns.
 */

import { BaseVisualModule } from '../BaseVisualModule';
import type { VisualModuleConfig } from '../VisualModuleTypes';
import type { InteractionEvent } from '../InteractionTypes';

/**
 * Reaction-Diffusion specific configuration
 */
interface ReactionDiffusionConfig extends VisualModuleConfig {
  feedRate: number;
  killRate: number;
  diffusionA: number;
  diffusionB: number;
  timeStep: number;
  gridWidth: number;
  gridHeight: number;
  colorIntensity: number;
  smoothing: number;
  driftSpeed: number;
}

export class ReactionDiffusionModule extends BaseVisualModule {
  private gridA: Float32Array | null = null;
  private gridB: Float32Array | null = null;
  private nextA: Float32Array | null = null;
  private nextB: Float32Array | null = null;
  private gridWidth: number = 0;
  private gridHeight: number = 0;
  private imageData: ImageData | null = null;
  private driftOffset: number = 0;

  protected getDefaultConfig(): ReactionDiffusionConfig {
    return {
      primaryColor: '#4a9e8e',
      secondaryColor: '#2d6a5f',
      accentColor: '#7fcdbb',
      opacity: 0.4,
      speed: 0.5,
      density: 0.6,
      complexity: 0.7,
      feedRate: 0.055,
      killRate: 0.062,
      diffusionA: 1.0,
      diffusionB: 0.5,
      timeStep: 0.8,
      gridWidth: 256,
      gridHeight: 256,
      colorIntensity: 0.6,
      smoothing: 0.9,
      driftSpeed: 0.1,
    };
  }

  protected onInit(): void {
    const config = this.config as ReactionDiffusionConfig;
    this.gridWidth = config.gridWidth;
    this.gridHeight = config.gridHeight;

    // Initialize grids
    const size = this.gridWidth * this.gridHeight;
    this.gridA = new Float32Array(size);
    this.gridB = new Float32Array(size);
    this.nextA = new Float32Array(size);
    this.nextB = new Float32Array(size);

    // Fill with initial state: A=1, B=0
    this.gridA.fill(1.0);
    this.gridB.fill(0.0);

    // Seed with random perturbations
    this.seedPattern();

    // Create image data for rendering
    if (this.ctx) {
      this.imageData = this.ctx.createImageData(this.gridWidth, this.gridHeight);
    }
  }

  protected onUpdate(deltaTime: number): void {
    const config = this.config as ReactionDiffusionConfig;
    
    if (!this.gridA || !this.gridB || !this.nextA || !this.nextB) return;

    // Apply reaction-diffusion equations
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const i = y * this.gridWidth + x;
        
        const a = this.gridA[i];
        const b = this.gridB[i];
        
        // Compute Laplacian for both chemicals
        const laplaceA = this.laplacian(this.gridA, x, y);
        const laplaceB = this.laplacian(this.gridB, x, y);
        
        // Gray-Scott reaction-diffusion equations
        const abb = a * b * b;
        const reaction = abb;
        
        this.nextA[i] = a + (config.diffusionA * laplaceA - reaction + config.feedRate * (1 - a)) * config.timeStep;
        this.nextB[i] = b + (config.diffusionB * laplaceB + reaction - (config.killRate + config.feedRate) * b) * config.timeStep;
        
        // Clamp values
        this.nextA[i] = Math.max(0, Math.min(1, this.nextA[i]));
        this.nextB[i] = Math.max(0, Math.min(1, this.nextB[i]));
      }
    }

    // Swap buffers
    [this.gridA, this.nextA] = [this.nextA, this.gridA];
    [this.gridB, this.nextB] = [this.nextB, this.gridB];

    // Update drift offset for subtle movement
    this.driftOffset += config.driftSpeed * deltaTime * 0.001;
  }

  protected onRender(): void {
    if (!this.ctx || !this.canvas || !this.gridB || !this.imageData) return;

    const config = this.config as ReactionDiffusionConfig;
    const { width, height } = this.getCanvasSize();

    // Convert grid to image data
    const data = this.imageData.data;
    const primaryRGB = this.hexToRgb(config.primaryColor);
    const secondaryRGB = this.hexToRgb(config.secondaryColor);
    const accentRGB = this.hexToRgb(config.accentColor);

    for (let i = 0; i < this.gridB.length; i++) {
      const value = this.gridB[i];
      
      // Map value to color gradient
      let r: number, g: number, b: number;
      
      if (value < 0.5) {
        // Interpolate between secondary and primary
        const t = value * 2;
        r = secondaryRGB.r + (primaryRGB.r - secondaryRGB.r) * t;
        g = secondaryRGB.g + (primaryRGB.g - secondaryRGB.g) * t;
        b = secondaryRGB.b + (primaryRGB.b - secondaryRGB.b) * t;
      } else {
        // Interpolate between primary and accent
        const t = (value - 0.5) * 2;
        r = primaryRGB.r + (accentRGB.r - primaryRGB.r) * t;
        g = primaryRGB.g + (accentRGB.g - primaryRGB.g) * t;
        b = primaryRGB.b + (accentRGB.b - primaryRGB.b) * t;
      }

      const idx = i * 4;
      data[idx] = r * config.colorIntensity;
      data[idx + 1] = g * config.colorIntensity;
      data[idx + 2] = b * config.colorIntensity;
      data[idx + 3] = 255 * value; // Alpha based on value, opacity applied via globalAlpha
    }

    // Clear canvas
    this.clearCanvas();

    // Draw the pattern scaled to canvas size
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Create temporary canvas for the pattern
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.gridWidth;
    tempCanvas.height = this.gridHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.putImageData(this.imageData, 0, 0);
      
      // Apply global opacity and draw scaled
      this.ctx.globalAlpha = config.opacity;
      this.ctx.drawImage(tempCanvas, 0, 0, width, height);
      this.ctx.globalAlpha = 1;
    }
  }

  protected onDestroy(): void {
    this.gridA = null;
    this.gridB = null;
    this.nextA = null;
    this.nextB = null;
    this.imageData = null;
  }

  protected onConfigUpdate(config: Partial<VisualModuleConfig>): void {
    const rdConfig = config as Partial<ReactionDiffusionConfig>;
    
    // If grid size changes, reinitialize
    if (rdConfig.gridWidth !== undefined || rdConfig.gridHeight !== undefined) {
      this.onDestroy();
      this.onInit();
    }
  }

  protected onReset(): void {
    if (this.gridA && this.gridB) {
      this.gridA.fill(1.0);
      this.gridB.fill(0.0);
      this.seedPattern();
    }
    this.driftOffset = 0;
  }

  protected onResize(width: number, height: number): void {
    // Suppress unused parameter warnings
    void width;
    void height;
    // Pattern maintains its own grid size, just re-renders at different scale
  }

  /**
   * Compute discrete Laplacian at position (x, y)
   * Uses 9-point stencil for smoother results
   */
  private laplacian(grid: Float32Array, x: number, y: number): number {
    const w = this.gridWidth;
    const h = this.gridHeight;

    // Wrap coordinates (toroidal boundary)
    const xm1 = (x - 1 + w) % w;
    const xp1 = (x + 1) % w;
    const ym1 = (y - 1 + h) % h;
    const yp1 = (y + 1) % h;

    const center = grid[y * w + x];
    
    // 9-point stencil weights
    const neighbors =
      grid[ym1 * w + xm1] * 0.05 +
      grid[ym1 * w + x]   * 0.2  +
      grid[ym1 * w + xp1] * 0.05 +
      grid[y   * w + xm1] * 0.2  +
      grid[y   * w + xp1] * 0.2  +
      grid[yp1 * w + xm1] * 0.05 +
      grid[yp1 * w + x]   * 0.2  +
      grid[yp1 * w + xp1] * 0.05;

    return neighbors - center;
  }

  /**
   * Seed initial pattern with random perturbations
   */
  private seedPattern(): void {
    if (!this.gridB) return;

    const config = this.config as ReactionDiffusionConfig;
    const centerX = Math.floor(this.gridWidth / 2);
    const centerY = Math.floor(this.gridHeight / 2);
    const radius = Math.min(this.gridWidth, this.gridHeight) * 0.3;

    // Add some random seeds spread across the canvas
    const seedCount = Math.floor(config.density * 15);
    for (let i = 0; i < seedCount; i++) {
      // Spread seeds more evenly across the canvas
      const angle = (Math.PI * 2 * i) / seedCount;
      const dist = Math.random() * radius;
      const x = centerX + Math.floor(Math.cos(angle) * dist);
      const y = centerY + Math.floor(Math.sin(angle) * dist);
      
      // Add a blob of B chemical
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const px = (x + dx + this.gridWidth) % this.gridWidth;
          const py = (y + dy + this.gridHeight) % this.gridHeight;
          const idx = py * this.gridWidth + px;
          
          const distFromCenter = Math.sqrt(dx * dx + dy * dy);
          if (distFromCenter < 4) {
            // Gradual falloff for smoother seeds
            const intensity = 1.0 - (distFromCenter / 4);
            this.gridB[idx] = Math.max(this.gridB[idx], intensity);
          }
        }
      }
    }
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Handle user interactions - add chemical concentration at touch point
   */
  protected onInteraction(event: InteractionEvent): void {
    if (!this.gridA || !this.gridB) return;

    if (event.type === 'tap' || event.type === 'pointerdown' || event.type === 'drag') {
      const config = this.config as ReactionDiffusionConfig;
      
      // Convert screen coordinates to grid coordinates
      const { width, height } = this.getCanvasSize();
      const gridX = Math.floor((event.point.x / width) * config.gridWidth);
      const gridY = Math.floor((event.point.y / height) * config.gridHeight);

      // Add a blob of chemical B at the interaction point
      const radius = 8;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= radius) {
            const x = (gridX + dx + config.gridWidth) % config.gridWidth;
            const y = (gridY + dy + config.gridHeight) % config.gridHeight;
            const idx = y * config.gridWidth + x;
            
            if (idx >= 0 && idx < this.gridB.length) {
              const strength = 1 - (dist / radius);
              this.gridB[idx] = Math.min(1, this.gridB[idx] + strength * 0.5);
              this.gridA[idx] = Math.max(0, this.gridA[idx] - strength * 0.2);
            }
          }
        }
      }

      // Emit event for audio synchronization
      this.emitEvent({
        type: 'pattern-emerged',
        timestamp: event.timestamp,
        data: { x: gridX, y: gridY },
      });
    }
  }
}
