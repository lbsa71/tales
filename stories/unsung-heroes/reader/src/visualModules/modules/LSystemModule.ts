/**
 * L-System Module (Lindenmayer System)
 * 
 * Rung 3: RNA-world organisms
 * Visual: Recursive fractal growth patterns with periodic mutations
 * 
 * Algorithm: Lindenmayer system generates strings which are interpreted
 * as turtle graphics commands, creating plant-like branching patterns.
 */

import { BaseVisualModule } from '../BaseVisualModule';
import type { VisualModuleConfig } from '../VisualModuleTypes';
import type { PlantCreatedEvent } from '../VisualModuleEvents';
import type { InteractionEvent } from '../InteractionTypes';

/**
 * L-System specific configuration
 */
interface LSystemConfig extends VisualModuleConfig {
  axiom: string;
  rules: Record<string, string>;
  angle: number;
  iterations: number;
  mutationRate: number;
  mutationInterval: number;
  lineWidth: number;
  segmentLength: number;
  glowIntensity: number;
  swayAmplitude: number;
  swayFrequency: number;
}

/**
 * Turtle state for graphics interpretation
 */
interface TurtleState {
  x: number;
  y: number;
  angle: number;
}

/**
 * Represents a line segment to draw
 */
interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  depth: number;
}

/**
 * Represents a single tree generation
 */
interface TreeGeneration {
  segments: Segment[];
  growthProgress: number; // 0 to 1, how much is grown
  decayProgress: number; // 0 to 1, how much has decayed (0 = alive, 1 = gone)
  age: number; // Time since creation in ms
  rules: Record<string, string>;
  angle: number; // Effective branching angle for this generation
  segmentLength: number; // Effective segment length for this generation
}

export class LSystemModule extends BaseVisualModule {
  private generations: TreeGeneration[] = [];
  private timeSinceLastMutation: number = 0;
  private swayOffset: number = 0;
  private baseRules: Record<string, string> = {};
  private growthDuration: number = 8000; // Time to fully grow in ms
  private decayDuration: number = 20000; // Time to fully decay in ms (slow fade)
  private generationInterval: number = 7000; // Time between new generations (overlap generations)
  private timeSinceLastGeneration: number = 0;
  private generationCounter: number = 0;

  protected getDefaultConfig(): LSystemConfig {
    return {
      primaryColor: '#8b9a5b',
      secondaryColor: '#5a6b3c',
      accentColor: '#b8c689',
      opacity: 0.35,
      speed: 0.3,
      density: 0.5,
      complexity: 0.6,
      axiom: 'F',
      rules: {
        'F': 'F[+F]F[-F]F',
      },
      angle: 25,
      iterations: 4,
      mutationRate: 0.02,
      mutationInterval: 8000,
      lineWidth: 2,
      segmentLength: 6,
      glowIntensity: 0.4,
      swayAmplitude: 2.5,
      swayFrequency: 0.1,
    };
  }

  protected onInit(): void {
    const config = this.config as LSystemConfig;
    this.baseRules = { ...config.rules };
    this.generations = [];
    this.timeSinceLastGeneration = 0;
    
    // Create first generation immediately
    // If canvas isn't ready, it will be regenerated on resize
    this.createNewGeneration();
  }

  protected onUpdate(deltaTime: number): void {
    const config = this.config as LSystemConfig;
    
    // Update sway animation
    this.swayOffset += config.swayFrequency * deltaTime * 0.001;
    
    // Update all generations
    for (const generation of this.generations) {
      generation.age += deltaTime;
      
      // Update growth progress
      if (generation.growthProgress < 1) {
        generation.growthProgress = Math.min(1, generation.age / this.growthDuration);
      }
      
      // Start decay when growth is complete
      if (generation.growthProgress >= 1 && generation.decayProgress < 1) {
        const decayStartTime = this.growthDuration;
        const timeSinceGrowthComplete = generation.age - decayStartTime;
        generation.decayProgress = Math.min(1, timeSinceGrowthComplete / this.decayDuration);
      }
    }
    
    // Remove fully decayed generations
    this.generations = this.generations.filter(gen => gen.decayProgress < 1);
    
    // Create new generation when it's time, or if we have no generations
    this.timeSinceLastGeneration += deltaTime;
    if (this.generations.length === 0 || this.timeSinceLastGeneration >= this.generationInterval) {
      this.timeSinceLastGeneration = 0;
      this.createNewGeneration();
    }
    
    // Check for mutation (affects base rules for future generations)
    this.timeSinceLastMutation += deltaTime;
    if (this.timeSinceLastMutation >= config.mutationInterval) {
      this.timeSinceLastMutation = 0;
      this.applyMutation();
    }
  }

  protected onRender(): void {
    if (!this.ctx) return;

    const config = this.config as LSystemConfig;

    // Clear canvas
    this.clearCanvas();

    // Calculate sway offset
    const sway = Math.sin(this.swayOffset) * config.swayAmplitude;

    // Draw all generations (oldest first so new ones appear on top)
    for (const generation of this.generations) {
      // Calculate opacity based on decay
      const decayAlpha = 1 - generation.decayProgress;
      if (decayAlpha <= 0) continue;

      // Apply global opacity
      this.ctx.globalAlpha = config.opacity * decayAlpha;

      // Calculate how many segments should be visible based on growth progress
      const visibleSegmentCount = Math.floor(generation.segments.length * generation.growthProgress);

      // Draw segments (only up to the growth progress)
      for (let i = 0; i < visibleSegmentCount; i++) {
        const segment = generation.segments[i];
        
        // Calculate alpha based on depth (thinner branches are more transparent)
        const depthRatio = segment.depth / config.iterations;
        const alpha = 0.3 + (1 - depthRatio) * 0.7;
        
        // Apply sway to segment (more sway at tips)
        const swayAmount = sway * depthRatio;
        const x1 = segment.x1 + swayAmount;
        const y1 = segment.y1;
        const x2 = segment.x2 + swayAmount;
        const y2 = segment.y2;

        // Draw glow
        if (config.glowIntensity > 0) {
          const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
          const alpha1 = Math.max(0, Math.min(1, alpha * config.glowIntensity * decayAlpha));
          const alpha2 = Math.max(0, Math.min(1, alpha * config.glowIntensity * decayAlpha));
          gradient.addColorStop(0, this.hexToRgba(config.primaryColor, alpha1));
          gradient.addColorStop(1, this.hexToRgba(config.accentColor, alpha2));
          
          this.ctx.strokeStyle = gradient;
          this.ctx.lineWidth = config.lineWidth * 3;
          this.ctx.lineCap = 'round';
          this.ctx.beginPath();
          this.ctx.moveTo(x1, y1);
          this.ctx.lineTo(x2, y2);
          this.ctx.stroke();
        }

        // Draw main line
        const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, config.secondaryColor);
        gradient.addColorStop(1, config.primaryColor);
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = config.lineWidth * (1 - depthRatio * 0.5);
        this.ctx.globalAlpha = alpha * config.opacity * decayAlpha;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
      }
    }

    // Reset global alpha
    this.ctx.globalAlpha = 1;
  }

  protected onDestroy(): void {
    this.generations = [];
  }

  protected onConfigUpdate(config: Partial<VisualModuleConfig>): void {
    const lsConfig = config as Partial<LSystemConfig>;
    
    // If structural parameters change, update base rules and create new generation
    if (lsConfig.rules !== undefined) {
      this.baseRules = { ...lsConfig.rules };
    }
    
    if (lsConfig.axiom !== undefined || 
        lsConfig.rules !== undefined || 
        lsConfig.iterations !== undefined ||
        lsConfig.angle !== undefined ||
        lsConfig.segmentLength !== undefined) {
      // Clear old generations and start fresh
      this.generations = [];
      this.timeSinceLastGeneration = 0;
      this.createNewGeneration();
    }
  }

  protected onReset(): void {
    const config = this.config as LSystemConfig;
    this.baseRules = { ...config.rules };
    this.timeSinceLastMutation = 0;
    this.swayOffset = 0;
    this.generations = [];
    this.timeSinceLastGeneration = 0;
    this.createNewGeneration();
  }

  protected onResize(width: number, height: number): void {
    // Suppress unused parameter warnings
    void width;
    void height;
    // Regenerate all generations to fit new canvas size
    const config = this.config as LSystemConfig;
    const existingGenerations = [...this.generations];
    this.generations = [];
    
    for (const gen of existingGenerations) {
      const lSystemString = this.generateLSystem(config.axiom, gen.rules, config.iterations);
      // Regenerate segments; we don't track the original base x so allow redistribution
      const segments = this.generateSegments(lSystemString, gen.angle, gen.segmentLength);
      
      this.generations.push({
        ...gen,
        segments,
      });
    }
  }

  /**
   * Create a new tree generation
   * @param startXOverride Optional explicit x-coordinate for the tree base in canvas space
   */
  private createNewGeneration(startXOverride?: number): void {
    const config = this.config as LSystemConfig;
    const { width, height } = this.getCanvasSize();
    
    // If canvas isn't ready, retry on next frame
    if (width === 0 || height === 0) {
      requestAnimationFrame(() => this.createNewGeneration());
      return;
    }
    
    // Create slightly mutated rules for this generation
    const rules = this.mutateRulesForGeneration();

    // Per-generation geometric variation
    const baseAngle = config.angle;
    const baseSegmentLength = config.segmentLength;
    const angleJitter = (Math.random() - 0.5) * 10; // +/- 5 degrees variation
    const lengthScale = 0.8 + Math.random() * 0.4; // 0.8x to 1.2x segment length
    const effectiveAngle = baseAngle + angleJitter;
    const effectiveSegmentLength = baseSegmentLength * lengthScale;
    
    // Generate L-system string
    const lSystemString = this.generateLSystem(config.axiom, rules, config.iterations);
    
    // Generate segments (optionally anchored to a specific x coordinate)
    const segments = this.generateSegments(
      lSystemString,
      effectiveAngle,
      effectiveSegmentLength,
      startXOverride
    );
    
    // Only create generation if we have segments
    if (segments.length > 0) {
      const generation: TreeGeneration = {
        segments,
        growthProgress: 0,
        decayProgress: 0,
        age: 0,
        rules,
        angle: effectiveAngle,
        segmentLength: effectiveSegmentLength,
      };
      
      this.generations.push(generation);
      this.generationCounter++;

      // Emit event for new plant creation
      const event: PlantCreatedEvent = {
        type: 'plant-created',
        timestamp: performance.now(),
        data: {
          generationIndex: this.generationCounter,
          segmentCount: segments.length,
          rules: { ...rules },
        },
      };
      this.emitEvent(event);
    }
  }

  /**
   * Generate L-system string using production rules
   */
  private generateLSystem(axiom: string, rules: Record<string, string>, iterations: number): string {
    let result = axiom;

    for (let i = 0; i < iterations; i++) {
      let next = '';
      for (const char of result) {
        next += rules[char] || char;
      }
      result = next;
    }

    return result;
  }

  /**
   * Convert L-system string to drawable segments using turtle graphics
   */
  private generateSegments(
    lSystemString: string,
    angle: number,
    segmentLength: number,
    startXOverride?: number
  ): Segment[] {
    const { width, height } = this.getCanvasSize();

    // Safety check - if canvas isn't sized yet, return empty
    if (width === 0 || height === 0) {
      return [];
    }

    const segments: Segment[] = [];

    // Starting position: use explicit interaction x when provided, otherwise spread along x-axis
    let startX: number;
    if (typeof startXOverride === 'number' && !Number.isNaN(startXOverride)) {
      // Clamp to avoid extreme edges
      const margin = width * 0.05;
      startX = Math.max(margin, Math.min(width - margin, startXOverride));
    } else {
      startX = width * (0.2 + 0.6 * Math.random());
    }
    const startY = height * 0.9;
    
    // Initial turtle state
    const turtle: TurtleState = {
      x: startX,
      y: startY,
      angle: -90, // Point upward
    };

    const stack: TurtleState[] = [];
    let currentDepth = 0;

    for (const char of lSystemString) {
      switch (char) {
        case 'F': {
          // Draw forward
          const radians = (turtle.angle * Math.PI) / 180;
          const newX = turtle.x + Math.cos(radians) * segmentLength;
          const newY = turtle.y + Math.sin(radians) * segmentLength;
          
          segments.push({
            x1: turtle.x,
            y1: turtle.y,
            x2: newX,
            y2: newY,
            depth: currentDepth,
          });
          
          turtle.x = newX;
          turtle.y = newY;
          break;
        }
        case '+':
          // Turn right
          turtle.angle += angle;
          break;
        case '-':
          // Turn left
          turtle.angle -= angle;
          break;
        case '[':
          // Push state
          stack.push({ ...turtle });
          currentDepth++;
          break;
        case ']':
          // Pop state
          if (stack.length > 0) {
            const state = stack.pop()!;
            turtle.x = state.x;
            turtle.y = state.y;
            turtle.angle = state.angle;
            currentDepth = Math.max(0, currentDepth - 1);
          }
          break;
        default:
          // Ignore other characters
          break;
      }
    }
    
    return segments;
  }

  /**
   * Create slightly mutated rules for a new generation
   */
  private mutateRulesForGeneration(): Record<string, string> {
    const rules = { ...this.baseRules };
    
    // High chance to slightly vary the rules for each generation
    if (Math.random() < 0.85) {
      const ruleKeys = Object.keys(rules);
      if (ruleKeys.length > 0) {
        const keyToMutate = ruleKeys[Math.floor(Math.random() * ruleKeys.length)];
        const currentRule = rules[keyToMutate];
        
        // Subtle mutations
        const mutations = [
          // Swap + and - occasionally
          () => currentRule.replace(/\+/g, '#').replace(/-/g, '+').replace(/#/g, '-'),
          // Add a small branch variation
          () => currentRule.replace(/F\]/g, 'F[+F]'),
          // Slightly simplify the pattern
          () => currentRule.replace(/\[[-+]?F\]/, 'F'),
          // Keep original
          () => currentRule,
        ];
        
        const mutation = mutations[Math.floor(Math.random() * mutations.length)];
        rules[keyToMutate] = mutation();
      }
    }
    
    return rules;
  }

  /**
   * Apply a random mutation to the base production rules (affects future generations)
   */
  private applyMutation(): void {
    const config = this.config as LSystemConfig;
    
    if (Math.random() < config.mutationRate) {
      // Mutate one of the base rules
      const ruleKeys = Object.keys(this.baseRules);
      if (ruleKeys.length > 0) {
        const keyToMutate = ruleKeys[Math.floor(Math.random() * ruleKeys.length)];
        const currentRule = this.baseRules[keyToMutate];
        
        // Simple mutation: change angle or add/remove a branch
        const mutations = [
          // Swap + and -
          () => currentRule.replace(/\+/g, '#').replace(/-/g, '+').replace(/#/g, '-'),
          // Add an extra branch
          () => currentRule + '[+F]',
          // Remove last character
          () => currentRule.slice(0, -1),
          // Revert to original
          () => config.rules[keyToMutate] || currentRule,
        ];
        
        const mutation = mutations[Math.floor(Math.random() * mutations.length)];
        this.baseRules[keyToMutate] = mutation();
      }
    }
  }

  /**
   * Convert hex color to rgba format
   */
  private hexToRgba(hex: string, alpha: number): string {
    // Remove # if present
    const cleanHex = hex.replace('#', '');
    
    // Parse RGB values
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Handle user interactions - trigger mutations or new growth
   */
  protected onInteraction(event: InteractionEvent): void {
    if (event.type === 'tap' || event.type === 'pointerdown') {
      // Create a new generation anchored at the interaction's x-coordinate
      this.createNewGeneration(event.point.x);
      // Reset generation timer so automatic generations continue from this interaction
      this.timeSinceLastGeneration = 0;

      // Emit event for audio synchronization
      this.emitEvent({
        type: 'mutation-occurred',
        timestamp: event.timestamp,
        data: { triggered: true },
      });
    }
  }
}
