/**
 * Force-Directed Graph Module
 * 
 * Rung 7: Humans (abstraction and representation)
 * Visual: Floating nodes with connections, clustering and reorganizing
 * 
 * Algorithm: Force-directed graph layout (Fruchterman-Reingold style)
 * Nodes repel each other while edges attract connected nodes, creating
 * an organic network layout that represents semantic relationships and
 * abstract knowledge structures.
 */

import { BaseVisualModule } from '../BaseVisualModule';
import type { VisualModuleConfig } from '../VisualModuleTypes';
import type { NodeActivatedEvent } from '../VisualModuleEvents';
import type { InteractionEvent } from '../InteractionTypes';

/**
 * Force-Directed Graph Module specific configuration
 */
export interface ForceDirectedGraphConfig extends VisualModuleConfig {
  nodeCount: number;
  edgeDensity: number;
  repulsionForce: number;
  attractionForce: number;
  damping: number;
  nodeSize: number;
  edgeThickness: number;
  glowIntensity: number;
  activationSpeed: number;
  activationDecay: number;
}

/**
 * 2D Vector
 */
interface Vector2D {
  x: number;
  y: number;
}

/**
 * Node in the graph
 */
interface GraphNode {
  id: number;
  position: Vector2D;
  velocity: Vector2D;
  force: Vector2D;
  activation: number;
  connections: number[];
}

/**
 * Edge between nodes
 */
interface GraphEdge {
  source: number;
  target: number;
  activation: number;
}

export class ForceDirectedGraphModule extends BaseVisualModule {
  private nodes: GraphNode[] = [];
  private edges: GraphEdge[] = [];
  private activationTimer: number = 0;

  protected getDefaultConfig(): ForceDirectedGraphConfig {
    return {
      primaryColor: '#5c9bc8',
      secondaryColor: '#476f8b',
      accentColor: '#00d7ff',
      opacity: 0.35,
      speed: 0.3,
      density: 0.3,
      complexity: 0.5,
      nodeCount: 20,
      edgeDensity: 0.18,
      repulsionForce: 1500,
      attractionForce: 0.03,
      damping: 0.88,
      nodeSize: 6,
      edgeThickness: 1.5,
      glowIntensity: 0.5,
      activationSpeed: 0.5,
      activationDecay: 0.97,
    };
  }

  protected onInit(): void {
    this.initializeGraph();
  }

  /**
   * Initialize the graph structure
   */
  private initializeGraph(): void {
    const { width, height } = this.getCanvasSize();
    const config = this.config as ForceDirectedGraphConfig;

    // Create nodes
    this.nodes = [];
    for (let i = 0; i < config.nodeCount; i++) {
      this.nodes.push({
        id: i,
        position: {
          x: width * (0.2 + 0.6 * Math.random()),
          y: height * (0.2 + 0.6 * Math.random()),
        },
        velocity: { x: 0, y: 0 },
        force: { x: 0, y: 0 },
        activation: Math.random() * 0.3,
        connections: [],
      });
    }

    // Create edges
    this.edges = [];
    const targetEdgeCount = Math.floor(
      (config.nodeCount * (config.nodeCount - 1) / 2) * config.edgeDensity
    );

    // Use preferential attachment for more realistic network
    const edgeCandidates: Array<[number, number]> = [];
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        edgeCandidates.push([i, j]);
      }
    }

    // Shuffle and select edges
    this.shuffleArray(edgeCandidates);
    for (let i = 0; i < Math.min(targetEdgeCount, edgeCandidates.length); i++) {
      const [source, target] = edgeCandidates[i];
      this.edges.push({
        source,
        target,
        activation: 0,
      });
      this.nodes[source].connections.push(target);
      this.nodes[target].connections.push(source);
    }

    this.activationTimer = 0;
  }

  protected onUpdate(deltaTime: number): void {
    const config = this.config as ForceDirectedGraphConfig;
    const { width, height } = this.getCanvasSize();

    // Update activation patterns
    this.activationTimer += deltaTime * config.activationSpeed;
    if (this.activationTimer >= 3000) {
      this.activationTimer = 0;
      // Activate a random node
      const randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      randomNode.activation = 1.0;
      
      // Emit event for node activation (flash)
      const event: NodeActivatedEvent = {
        type: 'node-activated',
        timestamp: performance.now(),
        data: {
          nodeId: randomNode.id,
          activationLevel: randomNode.activation,
          connectionCount: randomNode.connections.length,
        },
      };
      this.emitEvent(event);
    }

    // Propagate activation through network
    for (const edge of this.edges) {
      const sourceNode = this.nodes[edge.source];
      const targetNode = this.nodes[edge.target];

      // Propagate activation bidirectionally
      if (sourceNode.activation > 0.3) {
        targetNode.activation = Math.max(targetNode.activation, sourceNode.activation * 0.7);
        edge.activation = Math.max(edge.activation, sourceNode.activation * 0.8);
      }
      if (targetNode.activation > 0.3) {
        sourceNode.activation = Math.max(sourceNode.activation, targetNode.activation * 0.7);
        edge.activation = Math.max(edge.activation, targetNode.activation * 0.8);
      }
    }

    // Decay activation
    for (const node of this.nodes) {
      node.activation *= config.activationDecay;
    }
    for (const edge of this.edges) {
      edge.activation *= config.activationDecay;
    }

    // Calculate forces
    for (const node of this.nodes) {
      node.force = { x: 0, y: 0 };

      // Repulsion from all other nodes
      for (const other of this.nodes) {
        if (other.id === node.id) continue;

        const delta = this.subtract(node.position, other.position);
        const distance = Math.max(10, this.magnitude(delta));
        const repulsion = config.repulsionForce / (distance * distance);

        this.normalizeVector(delta);
        node.force.x += delta.x * repulsion;
        node.force.y += delta.y * repulsion;
      }

      // Attraction along edges
      for (const connectedId of node.connections) {
        const connected = this.nodes[connectedId];
        const delta = this.subtract(connected.position, node.position);
        const distance = this.magnitude(delta);
        const attraction = distance * config.attractionForce;

        this.normalizeVector(delta);
        node.force.x += delta.x * attraction;
        node.force.y += delta.y * attraction;
      }

      // Gentle pull towards center
      const center = { x: width / 2, y: height / 2 };
      const toCenter = this.subtract(center, node.position);
      const centerDist = this.magnitude(toCenter);
      if (centerDist > width * 0.3) {
        this.normalizeVector(toCenter);
        node.force.x += toCenter.x * 0.5;
        node.force.y += toCenter.y * 0.5;
      }
    }

    // Apply forces and update positions
    for (const node of this.nodes) {
      // Update velocity with damping
      node.velocity.x = node.velocity.x * config.damping + node.force.x;
      node.velocity.y = node.velocity.y * config.damping + node.force.y;

      // Limit velocity
      const maxVel = 3 * config.speed;
      this.limitVector(node.velocity, maxVel);

      // Update position
      node.position.x += node.velocity.x * 0.1;
      node.position.y += node.velocity.y * 0.1;

      // Keep nodes within bounds (soft boundary)
      const margin = 50;
      if (node.position.x < margin) node.position.x = margin;
      if (node.position.x > width - margin) node.position.x = width - margin;
      if (node.position.y < margin) node.position.y = margin;
      if (node.position.y > height - margin) node.position.y = height - margin;
    }
  }

  protected onRender(): void {
    if (!this.ctx) return;

    const config = this.config as ForceDirectedGraphConfig;

    // Clear canvas
    this.clearCanvas();

    this.ctx.globalAlpha = config.opacity;

    // Draw edges
    for (const edge of this.edges) {
      const source = this.nodes[edge.source];
      const target = this.nodes[edge.target];

      this.ctx.save();

      // Edge activation glow
      const edgeAlpha = 0.3 + edge.activation * 0.7;
      this.ctx.globalAlpha = config.opacity * edgeAlpha;

      if (edge.activation > 0.1 && config.glowIntensity > 0) {
        this.ctx.strokeStyle = config.accentColor;
        this.ctx.lineWidth = config.edgeThickness + 1;
        this.ctx.shadowBlur = 10 * config.glowIntensity * edge.activation;
        this.ctx.shadowColor = config.accentColor;
        this.ctx.beginPath();
        this.ctx.moveTo(source.position.x, source.position.y);
        this.ctx.lineTo(target.position.x, target.position.y);
        this.ctx.stroke();
      }

      // Draw edge
      this.ctx.strokeStyle = edge.activation > 0.3 ? config.primaryColor : config.secondaryColor;
      this.ctx.lineWidth = config.edgeThickness;
      this.ctx.shadowBlur = 0;
      this.ctx.beginPath();
      this.ctx.moveTo(source.position.x, source.position.y);
      this.ctx.lineTo(target.position.x, target.position.y);
      this.ctx.stroke();

      this.ctx.restore();
    }

    // Draw nodes
    for (const node of this.nodes) {
      this.ctx.save();

      const nodeAlpha = 0.5 + node.activation * 0.5;
      this.ctx.globalAlpha = config.opacity * nodeAlpha;

      // Node glow
      if (node.activation > 0.2 && config.glowIntensity > 0) {
        this.ctx.shadowBlur = 20 * config.glowIntensity * node.activation;
        this.ctx.shadowColor = config.accentColor;
      }

      // Draw node
      const nodeSize = config.nodeSize * (1 + node.activation * 0.5);
      this.ctx.fillStyle = node.activation > 0.3 ? config.accentColor : config.primaryColor;
      this.ctx.beginPath();
      this.ctx.arc(node.position.x, node.position.y, nodeSize, 0, Math.PI * 2);
      this.ctx.fill();

      // Inner highlight
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.beginPath();
      this.ctx.arc(node.position.x - nodeSize * 0.3, node.position.y - nodeSize * 0.3, nodeSize * 0.4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    this.ctx.globalAlpha = 1.0;
  }

  protected onDestroy(): void {
    this.nodes = [];
    this.edges = [];
  }

  protected onConfigUpdate(_config: Partial<VisualModuleConfig>): void {
    this.initializeGraph();
  }

  protected onReset(): void {
    this.initializeGraph();
  }

  protected onResize(_width: number, _height: number): void {
    // Keep existing graph, just let it reorganize
  }

  // Vector math helpers
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

  // Array shuffle helper
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Handle user interactions - activate nodes or add energy
   */
  protected onInteraction(event: InteractionEvent): void {
    if (!this.nodes) return;

    if (event.type === 'tap' || event.type === 'pointerdown' || event.type === 'drag') {
      // Find nearest node to interaction point
      let nearestNode = null;
      let nearestDist = Infinity;

      for (const node of this.nodes) {
        const dx = node.position.x - event.point.x;
        const dy = node.position.y - event.point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestNode = node;
        }
      }

      // Activate the nearest node
      if (nearestNode && nearestDist < 100) {
        nearestNode.activation = 1.0;
        
        // Also activate connected nodes
        for (const edge of this.edges) {
          if (edge.source === nearestNode.id || edge.target === nearestNode.id) {
            const connectedId = edge.source === nearestNode.id ? edge.target : edge.source;
            const connectedNode = this.nodes.find(n => n.id === connectedId);
            if (connectedNode) {
              connectedNode.activation = Math.max(connectedNode.activation, 0.5);
            }
          }
        }

        // Emit event for audio synchronization
        const evt: NodeActivatedEvent = {
          type: 'node-activated',
          timestamp: event.timestamp,
          data: {
            nodeId: nearestNode.id,
            activationLevel: nearestNode.activation,
            connectionCount: this.edges.filter(e => 
              e.source === nearestNode.id || e.target === nearestNode.id
            ).length,
          },
        };
        this.emitEvent(evt);
      }
    }
  }
}
