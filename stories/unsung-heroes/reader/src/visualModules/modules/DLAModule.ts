/**
 * DLA Module (Diffusion-Limited Aggregation)
 * 
 * Rung 1: Pre-cellular replicators
 * Visual: Slow particle wandering forming organic branching patterns
 * 
 * Algorithm: Particles perform random walk until they encounter the
 * aggregated structure, where they stick and become part of it.
 * Creates dendritic, tree-like patterns reminiscent of chemical precipitation.
 */

import { BaseVisualModule } from '../BaseVisualModule';
import type { DLAConfig, VisualModuleConfig } from '../VisualModuleTypes';
import type { InteractionEvent } from '../InteractionTypes';

/**
 * Represents a single particle in the simulation
 */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  trail: { x: number; y: number; alpha: number }[];
}

/**
 * Point in the aggregated structure
 */
interface AggregatedPoint {
  x: number;
  y: number;
  generation: number;  // How many steps from the seed
}

export class DLAModule extends BaseVisualModule {
  private particles: Particle[] = [];
  private aggregated: AggregatedPoint[] = [];
  private spatialGrid: Map<string, AggregatedPoint[]> = new Map();
  private gridCellSize: number = 10;
  private centerX: number = 0;
  private centerY: number = 0;
  private maxGeneration: number = 0;

  protected getDefaultConfig(): DLAConfig {
    return {
      primaryColor: '#c89b5c',
      secondaryColor: '#8b6f47',
      accentColor: '#a67c3d',
      opacity: 0.15, // Further reduced for more discrete/subtle background
      speed: 0.2,
      density: 0.3,
      complexity: 0.4,
      particleCount: 30,
      wanderSpeed: 0.3,
      stickingDistance: 4,
      branchingFactor: 0.75,
      particleSize: 3,
      glowRadius: 10,
      contrast: 0.3,
      trailLength: 4,
    };
  }

  protected onInit(): void {
    const { width, height } = this.getCanvasSize();
    
    // Ensure canvas has valid size (should be handled by BaseVisualModule, but add safeguard)
    if (width <= 0 || height <= 0) {
      console.warn('[DLAModule] Canvas size invalid during init, will retry on first update');
      // Will be fixed on first update or resize
    }
    
    this.centerX = width / 2;
    this.centerY = height / 2;

    // Seed the aggregation at the center
    this.seedAggregation();

    // Initialize particles
    this.initializeParticles();
  }

  protected onUpdate(deltaTime: number): void {
    const config = this.config as DLAConfig;
    const { width, height } = this.getCanvasSize();

    // Ensure center is correct (in case canvas size changed)
    const newCenterX = width / 2;
    const newCenterY = height / 2;
    if (this.centerX !== newCenterX || this.centerY !== newCenterY) {
      this.centerX = newCenterX;
      this.centerY = newCenterY;
    }

    // Update each particle
    for (const particle of this.particles) {
      // Random walk with slight drift toward center
      const driftStrength = 0.002 * config.wanderSpeed;
      const towardsCenter = {
        x: (this.centerX - particle.x) * driftStrength,
        y: (this.centerY - particle.y) * driftStrength,
      };

      // Random walk
      const randomStrength = config.wanderSpeed * 0.5;
      particle.vx += (Math.random() - 0.5) * randomStrength + towardsCenter.x;
      particle.vy += (Math.random() - 0.5) * randomStrength + towardsCenter.y;

      // Apply damping
      particle.vx *= 0.95;
      particle.vy *= 0.95;

      // Update position
      const oldX = particle.x;
      const oldY = particle.y;
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Add to trail
      particle.trail.push({ x: oldX, y: oldY, alpha: 1 });
      if (particle.trail.length > config.trailLength) {
        particle.trail.shift();
      }

      // Decay trail alpha
      particle.trail.forEach((point, i) => {
        point.alpha = (i + 1) / particle.trail.length;
      });

      // Wrap around edges
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;

      // Check for aggregation
      if (this.checkAggregation(particle)) {
        this.aggregateParticle(particle);
        this.resetParticle(particle);
      }

      particle.age += deltaTime;
    }
  }

  protected onRender(): void {
    if (!this.ctx) return;

    const config = this.config as DLAConfig;

    // Clear with slight trail effect (reduced by 30% for slower trail fade)
    this.clearCanvas(0.07);

    // Apply global opacity
    this.ctx.globalAlpha = config.opacity;

    // Render aggregated structure
    this.renderAggregated();

    // Render particles
    this.renderParticles();

    // Reset global alpha
    this.ctx.globalAlpha = 1;
  }

  protected onDestroy(): void {
    this.particles = [];
    this.aggregated = [];
    this.spatialGrid.clear();
  }

  protected onConfigUpdate(config: Partial<VisualModuleConfig>): void {
    const dlaConfig = config as Partial<DLAConfig>;
    
    // Update particle count if changed
    if (dlaConfig.particleCount !== undefined) {
      const diff = dlaConfig.particleCount - this.particles.length;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          this.particles.push(this.createParticle());
        }
      } else if (diff < 0) {
        this.particles.splice(dlaConfig.particleCount);
      }
    }
  }

  protected onReset(): void {
    this.aggregated = [];
    this.spatialGrid.clear();
    this.maxGeneration = 0;
    this.seedAggregation();
    this.particles.forEach(p => this.resetParticle(p));
  }

  protected onResize(width: number, height: number): void {
    this.centerX = width / 2;
    this.centerY = height / 2;
    
    // Rebuild spatial grid with new dimensions
    // This ensures the grid coordinates are correct after resize
    this.spatialGrid.clear();
    for (const point of this.aggregated) {
      this.addToSpatialGrid(point);
    }
  }

  /**
   * Seed the initial aggregation point
   */
  private seedAggregation(): void {
    const seedPoint: AggregatedPoint = {
      x: this.centerX,
      y: this.centerY,
      generation: 0,
    };
    this.aggregated.push(seedPoint);
    this.addToSpatialGrid(seedPoint);
  }

  /**
   * Initialize all particles
   */
  private initializeParticles(): void {
    const config = this.config as DLAConfig;
    this.particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      this.particles.push(this.createParticle());
    }
  }

  /**
   * Create a new particle at a random position
   */
  private createParticle(): Particle {
    const { width, height } = this.getCanvasSize();
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      age: 0,
      trail: [],
    };
  }

  /**
   * Reset a particle to a new random position
   */
  private resetParticle(particle: Particle): void {
    const { width, height } = this.getCanvasSize();
    particle.x = Math.random() * width;
    particle.y = Math.random() * height;
    particle.vx = 0;
    particle.vy = 0;
    particle.age = 0;
    particle.trail = [];
  }

  /**
   * Check if particle should aggregate
   */
  private checkAggregation(particle: Particle): boolean {
    const config = this.config as DLAConfig;
    const nearby = this.getNearbySpatialPoints(particle.x, particle.y, config.stickingDistance * 2);
    
    for (const point of nearby) {
      const dx = particle.x - point.x;
      const dy = particle.y - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < config.stickingDistance) {
        return Math.random() < config.branchingFactor;
      }
    }
    
    return false;
  }

  /**
   * Add particle to aggregated structure
   */
  private aggregateParticle(particle: Particle): void {
    const config = this.config as DLAConfig;
    
    // Find nearest aggregated point to determine generation
    let nearestDist = Infinity;
    let nearestGen = 0;
    
    const nearby = this.getNearbySpatialPoints(particle.x, particle.y, config.stickingDistance * 3);
    for (const point of nearby) {
      const dx = particle.x - point.x;
      const dy = particle.y - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestGen = point.generation;
      }
    }
    
    const newPoint: AggregatedPoint = {
      x: particle.x,
      y: particle.y,
      generation: nearestGen + 1,
    };
    
    this.aggregated.push(newPoint);
    this.addToSpatialGrid(newPoint);
    this.maxGeneration = Math.max(this.maxGeneration, newPoint.generation);
  }

  /**
   * Add point to spatial grid for fast lookup
   */
  private addToSpatialGrid(point: AggregatedPoint): void {
    const gridX = Math.floor(point.x / this.gridCellSize);
    const gridY = Math.floor(point.y / this.gridCellSize);
    const key = `${gridX},${gridY}`;
    
    if (!this.spatialGrid.has(key)) {
      this.spatialGrid.set(key, []);
    }
    this.spatialGrid.get(key)!.push(point);
  }

  /**
   * Get nearby points from spatial grid
   */
  private getNearbySpatialPoints(x: number, y: number, radius: number): AggregatedPoint[] {
    const points: AggregatedPoint[] = [];
    const cellRadius = Math.ceil(radius / this.gridCellSize);
    const centerGridX = Math.floor(x / this.gridCellSize);
    const centerGridY = Math.floor(y / this.gridCellSize);
    
    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        const key = `${centerGridX + dx},${centerGridY + dy}`;
        const cellPoints = this.spatialGrid.get(key);
        if (cellPoints) {
          points.push(...cellPoints);
        }
      }
    }
    
    return points;
  }

  /**
   * Render the aggregated structure
   */
  private renderAggregated(): void {
    if (!this.ctx) return;
    
    const config = this.config as DLAConfig;
    
    for (const point of this.aggregated) {
      // Color based on generation (older = more faded)
      const generationRatio = this.maxGeneration > 0 ? point.generation / this.maxGeneration : 1;
      const alpha = 0.3 + (generationRatio * 0.7);
      
      // Draw glow
      const gradient = this.ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, config.glowRadius
      );
      const alphaHex = Math.floor(alpha * 255).toString(16);
      const alphaHexPadded = alphaHex.length === 1 ? '0' + alphaHex : alphaHex;
      gradient.addColorStop(0, `${config.accentColor}${alphaHexPadded}`);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(
        point.x - config.glowRadius,
        point.y - config.glowRadius,
        config.glowRadius * 2,
        config.glowRadius * 2
      );
      
      // Draw particle core
      this.ctx.fillStyle = config.primaryColor;
      this.ctx.globalAlpha = alpha * config.contrast;
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, config.particleSize, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    }
  }

  /**
   * Render wandering particles
   */
  private renderParticles(): void {
    if (!this.ctx) return;
    
    const config = this.config as DLAConfig;
    
    for (const particle of this.particles) {
      // Draw trail
      for (let i = 0; i < particle.trail.length; i++) {
        const point = particle.trail[i];
        const alpha = point.alpha * 0.2 * config.contrast;
        
        this.ctx.fillStyle = config.secondaryColor;
        this.ctx.globalAlpha = alpha;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, config.particleSize * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // Draw particle glow
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, config.glowRadius * 0.7
      );
      gradient.addColorStop(0, `${config.primaryColor}66`);
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.globalAlpha = 1;
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(
        particle.x - config.glowRadius * 0.7,
        particle.y - config.glowRadius * 0.7,
        config.glowRadius * 1.4,
        config.glowRadius * 1.4
      );
      
      // Draw particle core
      this.ctx.fillStyle = config.primaryColor;
      this.ctx.globalAlpha = config.contrast * 0.8;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, config.particleSize, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    }
  }

  /**
   * Handle user interactions - move center of attraction to click location
   */
  protected onInteraction(event: InteractionEvent): void {
    if (event.type === 'tap' || event.type === 'pointerdown') {
      // Move the center of attraction to the click location
      this.centerX = event.point.x;
      this.centerY = event.point.y;
      
      // Clear existing aggregation and start fresh at new location
      this.aggregated = [];
      this.spatialGrid.clear();
      this.maxGeneration = 0;
      
      // Seed new aggregation at the clicked location
      this.seedAggregation();

      // Emit event for audio synchronization
      this.emitEvent({
        type: 'particle-stuck',
        timestamp: event.timestamp,
        data: { centerX: this.centerX, centerY: this.centerY },
      });
    }
  }
}
