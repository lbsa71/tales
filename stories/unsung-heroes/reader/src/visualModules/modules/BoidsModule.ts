/**
 * Boids Module (Flocking Simulation)
 * 
 * Rung 6: Sentient animals
 * Visual: Cohesive flock movement with separation, alignment, and cohesion
 * 
 * Algorithm: Reynolds' boids algorithm - autonomous agents that exhibit
 * emergent flocking behavior through three simple rules: separation (avoid
 * crowding), alignment (steer towards average heading), and cohesion (steer
 * towards average position).
 */

import { BaseVisualModule } from '../BaseVisualModule';
import type { VisualModuleConfig } from '../VisualModuleTypes';
import type { InteractionEvent } from '../InteractionTypes';

/**
 * Boids Module specific configuration
 */
export interface BoidsConfig extends VisualModuleConfig {
  boidCount: number;
  separationRadius: number;
  alignmentRadius: number;
  cohesionRadius: number;
  maxSpeed: number;
  maxForce: number;
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
  trailLength: number;
  boidSize: number;
  glowIntensity: number;
}

/**
 * 2D Vector
 */
interface Vector2D {
  x: number;
  y: number;
}

/**
 * Individual boid in the flock
 */
interface Boid {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  trail: Vector2D[];
}

export class BoidsModule extends BaseVisualModule {
  private boids: Boid[] = [];
  private spatialGrid: Map<string, Boid[]> = new Map();
  private gridCellSize: number = 100;
  private attractorPoint: Vector2D | null = null;
  private attractorStrength: number = 0;

  protected getDefaultConfig(): BoidsConfig {
    return {
      primaryColor: '#c85c9b',
      secondaryColor: '#8b476f',
      accentColor: '#ff00d7',
      opacity: 0.3,
      speed: 0.4,
      density: 0.3,
      complexity: 0.5,
      boidCount: 30,
      separationRadius: 30,
      alignmentRadius: 60,
      cohesionRadius: 80,
      maxSpeed: 2,
      maxForce: 0.08,
      separationWeight: 1.5,
      alignmentWeight: 1.0,
      cohesionWeight: 1.0,
      trailLength: 15,
      boidSize: 4,
      glowIntensity: 0.4,
    };
  }

  protected onInit(): void {
    this.initializeBoids();
  }

  /**
   * Initialize the flock
   */
  private initializeBoids(): void {
    const { width, height } = this.getCanvasSize();
    const config = this.config as BoidsConfig;

    this.boids = [];

    for (let i = 0; i < config.boidCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      this.boids.push({
        position: {
          x: Math.random() * width,
          y: Math.random() * height,
        },
        velocity: {
          x: Math.cos(angle) * config.maxSpeed * 0.5,
          y: Math.sin(angle) * config.maxSpeed * 0.5,
        },
        acceleration: { x: 0, y: 0 },
        trail: [],
      });
    }
  }

  protected onUpdate(_deltaTime: number): void {
    const config = this.config as BoidsConfig;
    const { width, height } = this.getCanvasSize();

    // Update spatial grid for efficient neighbor queries
    this.updateSpatialGrid();

    // Update each boid
    for (const boid of this.boids) {
      // Reset acceleration
      boid.acceleration = { x: 0, y: 0 };

      // Get nearby boids
      const neighbors = this.getNeighbors(boid);

      // Apply flocking rules
      const separation = this.separate(boid, neighbors);
      const alignment = this.align(boid, neighbors);
      const cohesion = this.cohere(boid, neighbors);

      // Weight the forces
      this.multiplyVector(separation, config.separationWeight);
      this.multiplyVector(alignment, config.alignmentWeight);
      this.multiplyVector(cohesion, config.cohesionWeight);

      // Apply forces
      this.applyForce(boid, separation);
      this.applyForce(boid, alignment);
      this.applyForce(boid, cohesion);

      // Apply attractor force if active
      if (this.attractorPoint && this.attractorStrength > 0.01) {
        const attractorForce = this.seekPoint(boid, this.attractorPoint);
        this.multiplyVector(attractorForce, this.attractorStrength);
        this.applyForce(boid, attractorForce);
      }

      // Decay attractor strength
      if (this.attractorStrength > 0) {
        this.attractorStrength *= 0.95;
      }

      // Update velocity
      boid.velocity.x += boid.acceleration.x;
      boid.velocity.y += boid.acceleration.y;

      // Limit speed
      this.limitVector(boid.velocity, config.maxSpeed * config.speed);

      // Update position
      boid.position.x += boid.velocity.x;
      boid.position.y += boid.velocity.y;

      // Wrap around edges
      if (boid.position.x < 0) boid.position.x = width;
      if (boid.position.x > width) boid.position.x = 0;
      if (boid.position.y < 0) boid.position.y = height;
      if (boid.position.y > height) boid.position.y = 0;

      // Update trail
      boid.trail.unshift({ x: boid.position.x, y: boid.position.y });
      if (boid.trail.length > config.trailLength) {
        boid.trail.pop();
      }
    }
  }

  /**
   * Update spatial grid for efficient neighbor queries
   */
  private updateSpatialGrid(): void {
    this.spatialGrid.clear();

    for (const boid of this.boids) {
      const key = this.getGridKey(boid.position);
      if (!this.spatialGrid.has(key)) {
        this.spatialGrid.set(key, []);
      }
      this.spatialGrid.get(key)!.push(boid);
    }
  }

  /**
   * Get grid key for a position
   */
  private getGridKey(position: Vector2D): string {
    const x = Math.floor(position.x / this.gridCellSize);
    const y = Math.floor(position.y / this.gridCellSize);
    return `${x},${y}`;
  }

  /**
   * Get nearby boids efficiently using spatial grid
   */
  private getNeighbors(boid: Boid): Boid[] {
    const neighbors: Boid[] = [];
    const config = this.config as BoidsConfig;
    const maxRadius = Math.max(config.separationRadius, config.alignmentRadius, config.cohesionRadius);

    // Check current cell and adjacent cells
    const gridX = Math.floor(boid.position.x / this.gridCellSize);
    const gridY = Math.floor(boid.position.y / this.gridCellSize);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${gridX + dx},${gridY + dy}`;
        const cellBoids = this.spatialGrid.get(key);
        if (cellBoids) {
          for (const other of cellBoids) {
            if (other !== boid) {
              const dist = this.distance(boid.position, other.position);
              if (dist < maxRadius) {
                neighbors.push(other);
              }
            }
          }
        }
      }
    }

    return neighbors;
  }

  /**
   * Separation: steer to avoid crowding
   */
  private separate(boid: Boid, neighbors: Boid[]): Vector2D {
    const config = this.config as BoidsConfig;
    const steer = { x: 0, y: 0 };
    let count = 0;

    for (const other of neighbors) {
      const dist = this.distance(boid.position, other.position);
      if (dist > 0 && dist < config.separationRadius) {
        const diff = this.subtract(boid.position, other.position);
        this.normalizeVector(diff);
        this.divideVector(diff, dist); // Weight by distance
        steer.x += diff.x;
        steer.y += diff.y;
        count++;
      }
    }

    if (count > 0) {
      this.divideVector(steer, count);
    }

    if (this.magnitude(steer) > 0) {
      this.normalizeVector(steer);
      this.multiplyVector(steer, config.maxSpeed);
      this.subtractVector(steer, boid.velocity);
      this.limitVector(steer, config.maxForce);
    }

    return steer;
  }

  /**
   * Alignment: steer towards average heading
   */
  private align(boid: Boid, neighbors: Boid[]): Vector2D {
    const config = this.config as BoidsConfig;
    const sum = { x: 0, y: 0 };
    let count = 0;

    for (const other of neighbors) {
      const dist = this.distance(boid.position, other.position);
      if (dist > 0 && dist < config.alignmentRadius) {
        sum.x += other.velocity.x;
        sum.y += other.velocity.y;
        count++;
      }
    }

    if (count > 0) {
      this.divideVector(sum, count);
      this.normalizeVector(sum);
      this.multiplyVector(sum, config.maxSpeed);
      const steer = this.subtract(sum, boid.velocity);
      this.limitVector(steer, config.maxForce);
      return steer;
    }

    return { x: 0, y: 0 };
  }

  /**
   * Cohesion: steer towards average position
   */
  private cohere(boid: Boid, neighbors: Boid[]): Vector2D {
    const config = this.config as BoidsConfig;
    const sum = { x: 0, y: 0 };
    let count = 0;

    for (const other of neighbors) {
      const dist = this.distance(boid.position, other.position);
      if (dist > 0 && dist < config.cohesionRadius) {
        sum.x += other.position.x;
        sum.y += other.position.y;
        count++;
      }
    }

    if (count > 0) {
      this.divideVector(sum, count);
      return this.seek(boid, sum);
    }

    return { x: 0, y: 0 };
  }

  /**
   * Seek: steer towards a target
   */
  private seek(boid: Boid, target: Vector2D): Vector2D {
    const config = this.config as BoidsConfig;
    const desired = this.subtract(target, boid.position);
    this.normalizeVector(desired);
    this.multiplyVector(desired, config.maxSpeed);
    const steer = this.subtract(desired, boid.velocity);
    this.limitVector(steer, config.maxForce);
    return steer;
  }

  /**
   * Apply force to boid
   */
  private applyForce(boid: Boid, force: Vector2D): void {
    boid.acceleration.x += force.x;
    boid.acceleration.y += force.y;
  }

  protected onRender(): void {
    if (!this.ctx) return;

    const config = this.config as BoidsConfig;

    // Clear with slight fade for trails
    this.clearCanvas(0.1);

    this.ctx.globalAlpha = config.opacity;

    // Draw trails
    for (const boid of this.boids) {
      if (boid.trail.length < 2) continue;

      this.ctx.save();

      // Draw trail with gradient
      for (let i = 0; i < boid.trail.length - 1; i++) {
        const alpha = (1 - i / boid.trail.length) * 0.3;
        this.ctx.globalAlpha = config.opacity * alpha;
        this.ctx.strokeStyle = config.secondaryColor;
        this.ctx.lineWidth = config.boidSize * 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(boid.trail[i].x, boid.trail[i].y);
        this.ctx.lineTo(boid.trail[i + 1].x, boid.trail[i + 1].y);
        this.ctx.stroke();
      }

      this.ctx.restore();
    }

    // Draw boids
    for (const boid of this.boids) {
      this.ctx.save();

      // Calculate heading angle
      const angle = Math.atan2(boid.velocity.y, boid.velocity.x);

      // Translate and rotate
      this.ctx.translate(boid.position.x, boid.position.y);
      this.ctx.rotate(angle);

      // Draw glow
      if (config.glowIntensity > 0) {
        this.ctx.shadowBlur = 15 * config.glowIntensity;
        this.ctx.shadowColor = config.accentColor;
      }

      // Draw triangle pointing in direction of movement
      this.ctx.fillStyle = config.primaryColor;
      this.ctx.beginPath();
      this.ctx.moveTo(config.boidSize * 2, 0);
      this.ctx.lineTo(-config.boidSize, config.boidSize);
      this.ctx.lineTo(-config.boidSize, -config.boidSize);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
    }

    this.ctx.globalAlpha = 1.0;
  }

  protected onDestroy(): void {
    this.boids = [];
    this.spatialGrid.clear();
  }

  protected onConfigUpdate(_config: Partial<VisualModuleConfig>): void {
    this.initializeBoids();
  }

  protected onReset(): void {
    this.initializeBoids();
  }

  protected onResize(_width: number, _height: number): void {
    // Keep existing boids, just let them wrap naturally
  }

  // Vector math helpers
  private distance(a: Vector2D, b: Vector2D): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private subtract(a: Vector2D, b: Vector2D): Vector2D {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  private magnitude(v: Vector2D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  private normalizeVector(v: Vector2D): void {
    const mag = this.magnitude(v);
    if (mag > 0) {
      v.x /= mag;
      v.y /= mag;
    }
  }

  private limitVector(v: Vector2D, max: number): void {
    const mag = this.magnitude(v);
    if (mag > max) {
      v.x = (v.x / mag) * max;
      v.y = (v.y / mag) * max;
    }
  }

  private multiplyVector(v: Vector2D, scalar: number): void {
    v.x *= scalar;
    v.y *= scalar;
  }

  private divideVector(v: Vector2D, scalar: number): void {
    if (scalar !== 0) {
      v.x /= scalar;
      v.y /= scalar;
    }
  }

  private subtractVector(a: Vector2D, b: Vector2D): void {
    a.x -= b.x;
    a.y -= b.y;
  }

  private seekPoint(boid: Boid, target: Vector2D): Vector2D {
    const desired = {
      x: target.x - boid.position.x,
      y: target.y - boid.position.y,
    };

    // Normalize and scale to max speed
    const d = Math.sqrt(desired.x * desired.x + desired.y * desired.y);
    if (d > 0) {
      desired.x = (desired.x / d) * (this.config as BoidsConfig).maxSpeed;
      desired.y = (desired.y / d) * (this.config as BoidsConfig).maxSpeed;
    }

    // Steering = Desired - Velocity
    const steer = {
      x: desired.x - boid.velocity.x,
      y: desired.y - boid.velocity.y,
    };

    this.limitVector(steer, (this.config as BoidsConfig).maxForce);
    return steer;
  }

  /**
   * Handle user interactions - set attractor point at interaction
   */
  protected onInteraction(event: InteractionEvent): void {
    if (event.type === 'tap' || event.type === 'pointerdown' || event.type === 'drag') {
      this.attractorPoint = { x: event.point.x, y: event.point.y };
      this.attractorStrength = 2.0; // Strong initial attraction

      // Emit event for audio synchronization
      this.emitEvent({
        type: 'boid-clustered',
        timestamp: event.timestamp,
        data: { attractorX: event.point.x, attractorY: event.point.y },
      });
    }
  }
}
