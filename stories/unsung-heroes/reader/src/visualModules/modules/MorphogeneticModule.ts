/**
 * Morphogenetic Module (Space Colonization Algorithm)
 * 
 * Rung 5: Multicellular life
 * Visual: Branching tendrils seeking attractors, creating vascular patterns
 * 
 * Algorithm: Space Colonization Algorithm - branches grow toward attractor points,
 * creating organic, tree-like structures reminiscent of vascular systems, neural
 * networks, or root systems.
 */

import { BaseVisualModule } from '../BaseVisualModule';
import type { VisualModuleConfig } from '../VisualModuleTypes';
import type { InteractionEvent } from '../InteractionTypes';

/**
 * Morphogenetic Module specific configuration
 */
export interface MorphogeneticConfig extends VisualModuleConfig {
  attractorCount: number;
  segmentLength: number;
  influenceRadius: number;
  killRadius: number;
  growthRate: number;
  maxNodes: number;
  branchThickness: number;
  glowIntensity: number;
  fadeInDuration: number;
  fadeOutDuration: number;
}

/**
 * 2D Vector helper
 */
interface Vector2D {
  x: number;
  y: number;
}

/**
 * Attractor point that influences branch growth
 */
interface Attractor {
  position: Vector2D;
  active: boolean;
}

/**
 * Node in the branching structure
 */
interface BranchNode {
  position: Vector2D;
  parent: BranchNode | null;
  children: BranchNode[];
  influencedBy: Attractor[];
  generation: number;
  age: number;
}

export class MorphogeneticModule extends BaseVisualModule {
  private attractors: Attractor[] = [];
  private rootNodes: BranchNode[] = [];
  private allNodes: BranchNode[] = [];
  private leafNodes: BranchNode[] = [];
  private growthTimer: number = 0;
  private cyclePhase: 'growing' | 'fading' | 'dormant' = 'growing';
  private cycleTimer: number = 0;
  private fadeAlpha: number = 1.0;
  private isInitialized: boolean = false;

  protected getDefaultConfig(): MorphogeneticConfig {
    return {
      primaryColor: '#9b5cc8',
      secondaryColor: '#6f478b',
      accentColor: '#d700ff',
      opacity: 0.25,
      speed: 0.3,
      density: 0.4,
      complexity: 0.6,
      attractorCount: 150,
      segmentLength: 8,
      influenceRadius: 80,
      killRadius: 15,
      growthRate: 1.5,
      maxNodes: 800,
      branchThickness: 2,
      glowIntensity: 0.3,
      fadeInDuration: 3000,
      fadeOutDuration: 2000,
    };
  }

  protected onInit(): void {
    // Delay initialization slightly to ensure canvas is sized
    // If canvas isn't ready, onResize will handle it
    const { width, height } = this.getCanvasSize();
    console.log('[MorphogeneticModule] onInit - canvas size:', width, height);
    if (width > 0 && height > 0) {
      this.initializeSystem();
      this.isInitialized = true;
      console.log('[MorphogeneticModule] Initialized with', this.attractors.length, 'attractors,', this.rootNodes.length, 'root nodes');
    } else {
      console.warn('[MorphogeneticModule] Canvas not ready, will retry in onUpdate');
    }
  }

  /**
   * Initialize the space colonization system
   */
  private initializeSystem(): void {
    const { width, height } = this.getCanvasSize();
    const config = this.config as MorphogeneticConfig;

    // Guard against zero-sized canvas
    if (width <= 0 || height <= 0) {
      console.warn('[MorphogeneticModule] Canvas size is zero, skipping initialization');
      return;
    }

    console.log('[MorphogeneticModule] initializeSystem - canvas:', width, 'x', height, 'config:', {
      attractorCount: config.attractorCount,
      segmentLength: config.segmentLength,
      growthRate: config.growthRate,
      maxNodes: config.maxNodes
    });

    // Create attractors distributed across the canvas for more interesting patterns
    // Some in clusters, some scattered
    this.attractors = [];
    const clusterCount = 4 + Math.floor(Math.random() * 3); // 4-6 clusters
    const attractorsPerCluster = Math.floor(config.attractorCount / clusterCount);
    const scatteredCount = config.attractorCount - (attractorsPerCluster * clusterCount);
    
    // Create clusters
    for (let c = 0; c < clusterCount; c++) {
      const clusterX = width * (0.2 + Math.random() * 0.6);
      const clusterY = height * (0.2 + Math.random() * 0.5); // Upper half
      const clusterRadius = width * 0.15;
      
      for (let i = 0; i < attractorsPerCluster; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * clusterRadius;
        this.attractors.push({
          position: {
            x: clusterX + Math.cos(angle) * radius,
            y: clusterY + Math.sin(angle) * radius,
          },
          active: true,
        });
      }
    }
    
    // Add scattered attractors
    for (let i = 0; i < scatteredCount; i++) {
      this.attractors.push({
        position: {
          x: Math.random() * width,
          y: Math.random() * height * 0.7,
        },
        active: true,
      });
    }

    // Create root nodes at the bottom
    this.rootNodes = [];
    this.allNodes = [];
    this.leafNodes = [];

    // Create more root nodes spread across the bottom for more interesting growth
    const rootCount = 4 + Math.floor(Math.random() * 3); // 4-6 roots
    for (let i = 0; i < rootCount; i++) {
      const rootNode: BranchNode = {
        position: {
          x: width * (0.15 + 0.7 * (i / (rootCount - 1 || 1)) + (Math.random() - 0.5) * 0.1),
          y: height * 0.95,
        },
        parent: null,
        children: [],
        influencedBy: [],
        generation: 0,
        age: 0,
      };
      this.rootNodes.push(rootNode);
      this.allNodes.push(rootNode);
      this.leafNodes.push(rootNode);
    }

    this.growthTimer = 0;
    this.cyclePhase = 'growing';
    this.cycleTimer = 0;
    this.fadeAlpha = 0;
    this.isInitialized = true;
  }

  protected onUpdate(deltaTime: number): void {
    const config = this.config as MorphogeneticConfig;

    // Ensure system is initialized if it wasn't during onInit
    if (!this.isInitialized) {
      const { width, height } = this.getCanvasSize();
      console.log('[MorphogeneticModule] onUpdate - retrying init, canvas size:', width, height);
      if (width > 0 && height > 0) {
        this.initializeSystem();
        this.isInitialized = true;
        console.log('[MorphogeneticModule] Initialized in onUpdate with', this.attractors.length, 'attractors,', this.rootNodes.length, 'root nodes');
      } else {
        // Canvas still not ready, skip update
        return;
      }
    }

    // Update age for all nodes
    for (const node of this.allNodes) {
      node.age += deltaTime;
    }

    // Handle grow/fade cycles
    this.cycleTimer += deltaTime;

    // Fade in at start
    if (this.cyclePhase === 'growing' && this.fadeAlpha < 1.0) {
      this.fadeAlpha = Math.min(1.0, this.fadeAlpha + deltaTime / config.fadeInDuration);
    }

    // Growing phase: 30-40 seconds (longer to allow more growth)
    if (this.cyclePhase === 'growing' && this.cycleTimer > 30000 + Math.random() * 10000) {
      this.cyclePhase = 'fading';
      this.cycleTimer = 0;
    }

    // Fading phase: 2-3 seconds
    if (this.cyclePhase === 'fading') {
      this.fadeAlpha = Math.max(0, this.fadeAlpha - deltaTime / config.fadeOutDuration);
      if (this.cycleTimer > config.fadeOutDuration) {
        this.cyclePhase = 'dormant';
        this.cycleTimer = 0;
      }
    }

    // Dormant phase: 1-2 seconds, then restart
    if (this.cyclePhase === 'dormant' && this.cycleTimer > 1000 + Math.random() * 1000) {
      this.initializeSystem();
      this.cyclePhase = 'growing';
      this.cycleTimer = 0;
    }

    // Space colonization growth
    if (this.cyclePhase === 'growing' && this.allNodes.length < config.maxNodes) {
      this.growthTimer += deltaTime * config.speed;

      // Grow new segments based on growth rate
      const nodesBefore = this.allNodes.length;
      const growthThreshold = 1000 / config.growthRate;
      while (this.growthTimer >= growthThreshold) {
        this.growthTimer -= growthThreshold;
        this.growBranches();
      }
      if (this.allNodes.length > nodesBefore) {
        console.log('[MorphogeneticModule] Grew from', nodesBefore, 'to', this.allNodes.length, 'nodes (leaf nodes:', this.leafNodes.length, 'active attractors:', this.attractors.filter(a => a.active).length, ')');
      }
    }
  }

  /**
   * Perform one step of space colonization growth
   */
  private growBranches(): void {
    const config = this.config as MorphogeneticConfig;

    // Reset influence for all leaf nodes
    for (const node of this.leafNodes) {
      node.influencedBy = [];
    }

    // For each active attractor, find the closest leaf node within influence radius
    let influencesFound = 0;
    for (const attractor of this.attractors) {
      if (!attractor.active) continue;

      let closestNode: BranchNode | null = null;
      let closestDist = config.influenceRadius;

      for (const node of this.leafNodes) {
        const dist = this.distance(node.position, attractor.position);
        if (dist < closestDist) {
          closestDist = dist;
          closestNode = node;
        }
      }

      // If found, add attractor to node's influence list
      if (closestNode) {
        closestNode.influencedBy.push(attractor);
        influencesFound++;
      }
    }

    // Debug: log if no influences found
    if (influencesFound === 0 && this.leafNodes.length > 0) {
      const { width, height } = this.getCanvasSize();
      const firstLeaf = this.leafNodes[0];
      const activeAttractors = this.attractors.filter(a => a.active);
      if (activeAttractors.length > 0) {
        const distToFirstAttractor = this.distance(firstLeaf.position, activeAttractors[0].position);
        console.warn('[MorphogeneticModule] No influences found! Leaf at:', firstLeaf.position, 'First attractor at:', activeAttractors[0].position, 'Distance:', distToFirstAttractor.toFixed(1), 'Influence radius:', config.influenceRadius, 'Canvas:', width, 'x', height);
      }
    }

    // Grow new nodes from influenced leaf nodes
    const newLeafNodes: BranchNode[] = [];

    for (const node of this.leafNodes) {
      if (node.influencedBy.length === 0) {
        // No influence, keep as leaf
        newLeafNodes.push(node);
        continue;
      }

      // Calculate average direction to all influencing attractors
      let avgDir = { x: 0, y: 0 };
      for (const attractor of node.influencedBy) {
        const dir = this.normalize(this.subtract(attractor.position, node.position));
        avgDir.x += dir.x;
        avgDir.y += dir.y;
      }
      avgDir.x /= node.influencedBy.length;
      avgDir.y /= node.influencedBy.length;
      avgDir = this.normalize(avgDir);

      // Create new node
      const newNode: BranchNode = {
        position: {
          x: node.position.x + avgDir.x * config.segmentLength,
          y: node.position.y + avgDir.y * config.segmentLength,
        },
        parent: node,
        children: [],
        influencedBy: [],
        generation: node.generation + 1,
        age: 0,
      };

      node.children.push(newNode);
      this.allNodes.push(newNode);
      newLeafNodes.push(newNode);

      // Deactivate attractors within kill radius
      for (const attractor of this.attractors) {
        if (attractor.active && this.distance(newNode.position, attractor.position) < config.killRadius) {
          attractor.active = false;
        }
      }
    }

    this.leafNodes = newLeafNodes;
  }

  protected onRender(): void {
    if (!this.ctx) {
      console.warn('[MorphogeneticModule] onRender - no context');
      return;
    }

    const config = this.config as MorphogeneticConfig;

    // Clear canvas
    this.clearCanvas();

    // Apply global opacity and fade
    // Note: We set base alpha here, but don't multiply again in drawBranchRecursive
    // to avoid double opacity application
    const effectiveAlpha = config.opacity * this.fadeAlpha;
    this.ctx.globalAlpha = effectiveAlpha;
    
    // Debug render info (throttled)
    if (Math.random() < 0.01) { // ~1% of renders
      console.log('[MorphogeneticModule] Render - nodes:', this.allNodes.length, 'roots:', this.rootNodes.length, 'fadeAlpha:', this.fadeAlpha.toFixed(3), 'effectiveAlpha:', effectiveAlpha.toFixed(3), 'phase:', this.cyclePhase);
    }

    // Draw branches
    if (this.allNodes.length > 0) {
      this.drawBranches();
    } else {
      console.warn('[MorphogeneticModule] onRender - no nodes to draw');
    }

    // Draw subtle attractor field (optional, very faint)
    if (config.glowIntensity > 0 && this.cyclePhase === 'growing') {
      this.drawAttractorField();
    }

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Draw all branches
   */
  private drawBranches(): void {
    if (!this.ctx) return;

    // Draw from root to leaves for proper layering
    for (const root of this.rootNodes) {
      this.drawBranchRecursive(root);
    }
  }

  /**
   * Recursively draw a branch and its children
   */
  private drawBranchRecursive(node: BranchNode): void {
    if (!this.ctx) return;

    const config = this.config as MorphogeneticConfig;

    // Draw connections to children
    if (node.children.length === 0 && node === this.rootNodes[0]) {
      // Debug: log if root has no children
      console.log('[MorphogeneticModule] Root node has no children yet, total nodes:', this.allNodes.length, 'leaf nodes:', this.leafNodes.length);
    }
    for (const child of node.children) {
      // Calculate thickness based on depth (thicker at base)
      const thickness = config.branchThickness * Math.max(0.3, 1 - node.generation * 0.05);

      // Calculate age-based fade in (new segments fade in)
      // Use a faster fade-in and don't multiply globalAlpha (it's already set)
      const ageFade = Math.min(1, node.age / 200); // Faster fade-in (200ms instead of 500ms)

      this.ctx.save();
      // Apply age fade on top of the base opacity
      this.ctx.globalAlpha = (this.ctx.globalAlpha || 1) * ageFade;

      // Draw line with glow
      if (config.glowIntensity > 0) {
        this.ctx.strokeStyle = config.accentColor;
        this.ctx.lineWidth = thickness + 2;
        this.ctx.shadowBlur = 10 * config.glowIntensity;
        this.ctx.shadowColor = config.accentColor;
        this.ctx.beginPath();
        this.ctx.moveTo(node.position.x, node.position.y);
        this.ctx.lineTo(child.position.x, child.position.y);
        this.ctx.stroke();
      }

      // Draw solid line
      this.ctx.strokeStyle = config.primaryColor;
      this.ctx.lineWidth = thickness;
      this.ctx.shadowBlur = 0;
      this.ctx.beginPath();
      this.ctx.moveTo(node.position.x, node.position.y);
      this.ctx.lineTo(child.position.x, child.position.y);
      this.ctx.stroke();

      this.ctx.restore();

      // Recursively draw child
      this.drawBranchRecursive(child);
    }
  }

  /**
   * Draw subtle attractor influence field
   */
  private drawAttractorField(): void {
    if (!this.ctx) return;

    const config = this.config as MorphogeneticConfig;

    this.ctx.save();
    this.ctx.globalAlpha *= 0.05 * config.glowIntensity;

    for (const attractor of this.attractors) {
      if (!attractor.active) continue;

      const gradient = this.ctx.createRadialGradient(
        attractor.position.x,
        attractor.position.y,
        0,
        attractor.position.x,
        attractor.position.y,
        config.influenceRadius * 0.5
      );
      gradient.addColorStop(0, config.accentColor);
      gradient.addColorStop(1, 'transparent');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(
        attractor.position.x - config.influenceRadius * 0.5,
        attractor.position.y - config.influenceRadius * 0.5,
        config.influenceRadius,
        config.influenceRadius
      );
    }

    this.ctx.restore();
  }

  protected onDestroy(): void {
    this.attractors = [];
    this.rootNodes = [];
    this.allNodes = [];
    this.leafNodes = [];
  }

  protected onConfigUpdate(_config: Partial<VisualModuleConfig>): void {
    // Reinitialize with new config
    this.initializeSystem();
  }

  protected onReset(): void {
    this.initializeSystem();
  }

  protected onResize(width: number, height: number): void {
    // Only reinitialize if we have valid dimensions
    if (width > 0 && height > 0) {
      this.initializeSystem();
      this.isInitialized = true;
    }
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

  private normalize(v: Vector2D): Vector2D {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    if (len === 0) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
  }

  /**
   * Handle user interactions - add attractors at touch points
   */
  protected onInteraction(event: InteractionEvent): void {
    if (event.type === 'tap' || event.type === 'pointerdown') {
      // Add new attractor at interaction point
      if (this.attractors) {
        this.attractors.push({ 
          position: { x: event.point.x, y: event.point.y },
          active: true,
        });
        
        // Emit event for audio synchronization
        this.emitEvent({
          type: 'branch-formed',
          timestamp: event.timestamp,
          data: { x: event.point.x, y: event.point.y },
        });
      }
    }
  }
}
