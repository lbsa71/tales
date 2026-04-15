/**
 * Neural Activation Module
 * 
 * Rung 8: The Pattern (machine minds, narrator)
 * Visual: Grid or point cluster with activation waves, shifting intensity patterns
 * 
 * Algorithm: Grid-based activation propagation system
 * Activation spreads through a network of nodes with decay and threshold effects,
 * creating wave-like patterns that represent computational processes and neural
 * activity in machine minds.
 */

import { BaseVisualModule } from '../BaseVisualModule';
import type { VisualModuleConfig } from '../VisualModuleTypes';
import type { InteractionEvent } from '../InteractionTypes';

/**
 * Neural Activation Module specific configuration
 */
export interface NeuralActivationConfig extends VisualModuleConfig {
  gridSize: number;
  activationDecay: number;
  propagationSpeed: number;
  activationThreshold: number;
  clusterCount: number;
  nodeSize: number;
  connectionThickness: number;
  glowIntensity: number;
  pulseInterval: number;
  noiseIntensity: number;
}

/**
 * 2D Vector
 */
interface Vector2D {
  x: number;
  y: number;
}

/**
 * Node in the neural grid
 */
interface NeuralNode {
  position: Vector2D;
  basePosition: Vector2D; // Original position for drift calculation
  velocity: Vector2D; // Movement velocity
  energy: number; // Current energy level
  baseEnergy: number; // Baseline energy level
  connections: number[];
  cluster: number;
  movementPhase: number; // Phase for periodic movement
  fireTimer: number; // Time until next fire opportunity
  fireInterval: number; // Interval between fires (2s + random 2s)
}

export class NeuralActivationModule extends BaseVisualModule {
  private nodes: NeuralNode[] = [];
  private gridWidth: number = 0;
  private gridHeight: number = 0;
  private pulseTimer: number = 0;
  private noiseOffset: number = 0;
  private edgeMovementTimer: number = 0;
  private edgeMovementActive: boolean = false;
  private energyShuffleTimer: number = 0;

  protected getDefaultConfig(): NeuralActivationConfig {
    return {
      primaryColor: '#5c6cc8',
      secondaryColor: '#47518b',
      accentColor: '#007dff',
      opacity: 0.4,
      speed: 0.4,
      density: 0.5,
      complexity: 0.7,
      gridSize: 20,
      activationDecay: 0.96,
      propagationSpeed: 0.15,
      activationThreshold: 0.3,
      clusterCount: 6,
      nodeSize: 5,
      connectionThickness: 1,
      glowIntensity: 0.6,
      pulseInterval: 2500,
      noiseIntensity: 0.1,
    };
  }

  protected onInit(): void {
    this.initializeNetwork();
  }

  /**
   * Initialize the neural network structure
   */
  private initializeNetwork(): void {
    const { width, height } = this.getCanvasSize();
    const config = this.config as NeuralActivationConfig;

    this.gridWidth = config.gridSize;
    this.gridHeight = config.gridSize;

    // Calculate spacing
    const spacingX = width / (this.gridWidth + 1);
    const spacingY = height / (this.gridHeight + 1);

    // Create cluster centers
    const clusterCenters: Vector2D[] = [];
    for (let i = 0; i < config.clusterCount; i++) {
      clusterCenters.push({
        x: Math.random() * width,
        y: Math.random() * height,
      });
    }

    // Create nodes in grid pattern
    this.nodes = [];
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const baseX = (x + 1) * spacingX;
        const baseY = (y + 1) * spacingY;

        // Add slight randomness to position
        const jitterX = (Math.random() - 0.5) * spacingX * 0.3;
        const jitterY = (Math.random() - 0.5) * spacingY * 0.3;

        // Find nearest cluster
        let nearestCluster = 0;
        let nearestDist = Infinity;
        for (let c = 0; c < clusterCenters.length; c++) {
          const dist = this.distance(
            { x: baseX + jitterX, y: baseY + jitterY },
            clusterCenters[c]
          );
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestCluster = c;
          }
        }

        const basePos = {
          x: baseX + jitterX,
          y: baseY + jitterY,
        };
        
        const node: NeuralNode = {
          position: { ...basePos },
          basePosition: basePos,
          velocity: {
            x: (Math.random() - 0.5) * 0.2,
            y: (Math.random() - 0.5) * 0.2,
          },
          energy: 0.1 + Math.random() * 0.8, // Start with highly varied energy (0.1-0.9)
          baseEnergy: 0.4 + Math.random() * 0.2, // Baseline energy (target equilibrium)
          connections: [],
          cluster: nearestCluster,
          movementPhase: Math.random() * Math.PI * 2,
          fireTimer: 2000 + Math.random() * 2000, // 2-4 seconds initial timer
          fireInterval: 2000 + Math.random() * 2000, // 2-4 seconds between fires
        };

        this.nodes.push(node);
      }
    }

    // Create connections (grid + some long-range)
    for (let i = 0; i < this.nodes.length; i++) {
      const x = i % this.gridWidth;
      const y = Math.floor(i / this.gridWidth);

      // Connect to adjacent nodes in grid
      const neighbors = [
        [x - 1, y], [x + 1, y], // horizontal
        [x, y - 1], [x, y + 1], // vertical
        [x - 1, y - 1], [x + 1, y - 1], // diagonal
        [x - 1, y + 1], [x + 1, y + 1],
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < this.gridWidth && ny >= 0 && ny < this.gridHeight) {
          const neighborIndex = ny * this.gridWidth + nx;
          if (!this.nodes[i].connections.includes(neighborIndex)) {
            this.nodes[i].connections.push(neighborIndex);
          }
        }
      }

      // Add some long-range connections within same cluster
      if (Math.random() < 0.3) {
        const sameClusterNodes = this.nodes
          .map((n, idx) => ({ node: n, idx }))
          .filter(({ node }) => node.cluster === this.nodes[i].cluster);

        if (sameClusterNodes.length > 0) {
          const randomNode = sameClusterNodes[Math.floor(Math.random() * sameClusterNodes.length)];
          if (!this.nodes[i].connections.includes(randomNode.idx)) {
            this.nodes[i].connections.push(randomNode.idx);
          }
        }
      }
    }

    this.pulseTimer = 0;
    this.noiseOffset = 0;
    this.edgeMovementTimer = 0;
    this.edgeMovementActive = false;
    this.energyShuffleTimer = 0;
  }

  protected onUpdate(deltaTime: number): void {
    const config = this.config as NeuralActivationConfig;

    this.noiseOffset += deltaTime * 0.0001;

    // Pulse timer - periodically activate random clusters for wave-like pulsations
    this.pulseTimer += deltaTime * config.speed;
    if (this.pulseTimer >= config.pulseInterval) {
      this.pulseTimer = 0;
      
      // Activate random cluster with energy burst
      const randomCluster = Math.floor(Math.random() * config.clusterCount);
      for (const node of this.nodes) {
        if (node.cluster === randomCluster) {
          // Give cluster nodes a significant energy boost
          node.energy = Math.max(node.energy, 0.6 + Math.random() * 0.3);
        }
      }
    }

    // Energy shuffle timer - periodically inject random energy to prevent equilibrium
    this.energyShuffleTimer += deltaTime;
    const shuffleInterval = 800 + Math.random() * 1200; // 0.8-2.0 seconds (more frequent)
    if (this.energyShuffleTimer >= shuffleInterval) {
      this.energyShuffleTimer = 0;
      this.shuffleEnergy();
    }

    // Edge movement timer - periodically trigger edge movement
    this.edgeMovementTimer += deltaTime;
    const movementInterval = 3000 + Math.random() * 2000; // 3-5 seconds
    if (this.edgeMovementTimer >= movementInterval) {
      this.edgeMovementTimer = 0;
      this.edgeMovementActive = !this.edgeMovementActive;
      
      // When activating movement, give nodes new velocities
      if (this.edgeMovementActive) {
        for (const node of this.nodes) {
          node.velocity = {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5,
          };
          node.movementPhase = Math.random() * Math.PI * 2;
        }
      }
    }

    // Update node positions if movement is active
    if (this.edgeMovementActive) {
      const { width, height } = this.getCanvasSize();
      const movementSpeed = 0.3;
      const driftAmount = 15; // Max pixels to drift from base position
      
      for (const node of this.nodes) {
        // Oscillatory movement around base position
        node.movementPhase += deltaTime * 0.001;
        const oscillationX = Math.sin(node.movementPhase) * driftAmount;
        const oscillationY = Math.cos(node.movementPhase * 0.7) * driftAmount;
        
        // Add velocity-based drift
        node.position.x = node.basePosition.x + oscillationX + node.velocity.x * deltaTime * movementSpeed;
        node.position.y = node.basePosition.y + oscillationY + node.velocity.y * deltaTime * movementSpeed;
        
        // Keep nodes within bounds
        node.position.x = Math.max(10, Math.min(width - 10, node.position.x));
        node.position.y = Math.max(10, Math.min(height - 10, node.position.y));
        
        // Dampen velocity to prevent excessive drift
        node.velocity.x *= 0.98;
        node.velocity.y *= 0.98;
      }
    } else {
      // Gradually return to base positions when movement is inactive
      for (const node of this.nodes) {
        const returnSpeed = 0.05;
        node.position.x += (node.basePosition.x - node.position.x) * returnSpeed;
        node.position.y += (node.basePosition.y - node.position.y) * returnSpeed;
      }
    }

    // Calculate global average energy
    let totalEnergy = 0;
    for (const node of this.nodes) {
      totalEnergy += node.energy;
    }
    const globalAverageEnergy = totalEnergy / this.nodes.length;

    // Update fire timers and process firing
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      
      // Update fire timer
      node.fireTimer -= deltaTime;
      
      // Check if node can fire (above average and timer ready)
      if (node.energy > globalAverageEnergy && node.fireTimer <= 0) {
        // Reset fire timer with new random interval
        node.fireTimer = node.fireInterval = 2000 + Math.random() * 2000;
        
        // Calculate surplus energy
        const surplus = node.energy - globalAverageEnergy;
        
        // Fire if there's any meaningful surplus (lower threshold for more activity)
        if (surplus > 0.02 && node.connections.length > 0) {
          // Choose a random connected neighbor
          const randomConnectionIdx = node.connections[Math.floor(Math.random() * node.connections.length)];
          const target = this.nodes[randomConnectionIdx];
          
          // Transfer a significant portion of the surplus (50-100% for more visible effect)
          const transferAmount = surplus * (0.5 + Math.random() * 0.5); // Transfer 50-100% of surplus
          
          // Transfer energy
          node.energy -= transferAmount;
          target.energy += transferAmount;
          
          // Clamp energies to reasonable bounds
          node.energy = Math.max(0, Math.min(1, node.energy));
          target.energy = Math.max(0, Math.min(1, target.energy));
        }
      }
    }

    // Apply very gentle energy decay toward equilibrium (much slower to allow firing to be visible)
    const equilibriumRate = 0.0001; // Very slow drift toward base energy per millisecond
    for (const node of this.nodes) {
      // Very gentle drift toward base energy (so firing effects are visible longer)
      const energyDiff = node.baseEnergy - node.energy;
      node.energy += energyDiff * equilibriumRate * deltaTime;
      
      // Clamp energy
      node.energy = Math.max(0, Math.min(1, node.energy));
    }
  }

  /**
   * Randomly shuffle energy across the network to prevent equilibrium
   * More radical version with dramatic energy redistribution
   */
  private shuffleEnergy(): void {
    const config = this.config as NeuralActivationConfig;
    
    // Strategy 1: Massive random energy bursts (more frequent and larger)
    const burstCount = 5 + Math.floor(Math.random() * 8); // 5-12 random bursts
    for (let i = 0; i < burstCount; i++) {
      const randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      const burstAmount = 0.5 + Math.random() * 0.5; // 0.5-1.0 energy burst (more dramatic)
      randomNode.energy = Math.min(1, randomNode.energy + burstAmount);
    }

    // Strategy 2: Radical cluster energy concentration - drain one cluster, boost another
    if (Math.random() < 0.7) { // 70% chance
      const drainCluster = Math.floor(Math.random() * config.clusterCount);
      const boostCluster = Math.floor(Math.random() * config.clusterCount);
      
      if (drainCluster !== boostCluster) {
        const drainNodes = this.nodes.filter(n => n.cluster === drainCluster);
        const boostNodes = this.nodes.filter(n => n.cluster === boostCluster);
        
        // Collect most energy from drain cluster
        let totalDrained = 0;
        for (const node of drainNodes) {
          const drainAmount = node.energy * (0.4 + Math.random() * 0.4); // 40-80% drained
          node.energy -= drainAmount;
          totalDrained += drainAmount;
        }
        
        // Concentrate all drained energy into a few nodes in boost cluster
        const concentrationCount = Math.max(1, Math.floor(boostNodes.length * (0.1 + Math.random() * 0.2))); // 10-30% of cluster
        const selected = [...boostNodes].sort(() => Math.random() - 0.5).slice(0, concentrationCount);
        const energyPerNode = totalDrained / concentrationCount;
        
        for (const node of selected) {
          node.energy = Math.min(1, node.energy + energyPerNode);
        }
      }
    }

    // Strategy 3: Energy wave - create a cascading effect through connected nodes
    if (Math.random() < 0.5) { // 50% chance
      const waveStart = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      waveStart.energy = 0.9 + Math.random() * 0.1; // 0.9-1.0
      
      // Cascade to connected nodes with decay
      const visited = new Set<number>();
      const queue: { node: NeuralNode; energy: number; depth: number }[] = [
        { node: waveStart, energy: waveStart.energy, depth: 0 }
      ];
      
      while (queue.length > 0 && queue[0].depth < 3) { // Max 3 levels deep
        const current = queue.shift()!;
        const nodeIndex = this.nodes.indexOf(current.node);
        
        if (visited.has(nodeIndex)) continue;
        visited.add(nodeIndex);
        
        // Add energy to connected nodes
        for (const connectedIdx of current.node.connections) {
          if (!visited.has(connectedIdx)) {
            const connected = this.nodes[connectedIdx];
            const cascadeEnergy = current.energy * (0.3 + Math.random() * 0.3); // 30-60% of source
            connected.energy = Math.min(1, connected.energy + cascadeEnergy);
            queue.push({ node: connected, energy: cascadeEnergy, depth: current.depth + 1 });
          }
        }
      }
    }

    // Strategy 4: Massive energy spike to random node (more frequent and dramatic)
    if (Math.random() < 0.6) { // 60% chance
      const spikeNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      spikeNode.energy = 0.95 + Math.random() * 0.05; // 0.95-1.0 energy spike
    }

    // Strategy 5: Energy inversion - swap high and low energy nodes
    if (Math.random() < 0.4) { // 40% chance
      const sortedNodes = [...this.nodes].sort((a, b) => a.energy - b.energy);
      const lowEnergyNodes = sortedNodes.slice(0, Math.floor(sortedNodes.length * 0.2)); // Bottom 20%
      const highEnergyNodes = sortedNodes.slice(-Math.floor(sortedNodes.length * 0.2)); // Top 20%
      
      // Swap energies
      for (let i = 0; i < Math.min(lowEnergyNodes.length, highEnergyNodes.length); i++) {
        const temp = lowEnergyNodes[i].energy;
        lowEnergyNodes[i].energy = highEnergyNodes[i].energy;
        highEnergyNodes[i].energy = temp;
      }
    }

    // Ensure all energies are clamped
    for (const node of this.nodes) {
      node.energy = Math.max(0, Math.min(1, node.energy));
    }
  }

  protected onRender(): void {
    if (!this.ctx) return;

    const config = this.config as NeuralActivationConfig;

    // Clear canvas
    this.clearCanvas();

    // Draw connections (only active ones) - brightness reflects energy
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];

      if (node.energy > config.activationThreshold) {
        for (const connectedIdx of node.connections) {
          const connected = this.nodes[connectedIdx];

          if (connected.energy > config.activationThreshold) {
            this.ctx.save();

            // Connection energy is average of both nodes - use energy directly for opacity
            const connectionEnergy = (node.energy + connected.energy) / 2;
            this.ctx.globalAlpha = config.opacity * connectionEnergy * 0.6; // Increased from 0.4 to 0.6

            // Draw connection
            this.ctx.strokeStyle = config.secondaryColor;
            this.ctx.lineWidth = config.connectionThickness;

            if (connectionEnergy > 0.6 && config.glowIntensity > 0) {
              this.ctx.shadowBlur = 8 * config.glowIntensity * connectionEnergy;
              this.ctx.shadowColor = config.accentColor;
            }

            this.ctx.beginPath();
            this.ctx.moveTo(node.position.x, node.position.y);
            this.ctx.lineTo(connected.position.x, connected.position.y);
            this.ctx.stroke();

            this.ctx.restore();
          }
        }
      }
    }

    // Draw nodes - brightness directly reflects energy
    for (const node of this.nodes) {
      this.ctx.save();

      // Brightness = energy directly (no double opacity)
      this.ctx.globalAlpha = config.opacity * node.energy; // Direct energy mapping

      // Node glow - stronger for higher energy
      if (node.energy > 0.1 && config.glowIntensity > 0) {
        this.ctx.shadowBlur = 25 * config.glowIntensity * node.energy; // Increased glow
        this.ctx.shadowColor = config.accentColor;
      }

      // Node size scales with energy (more dramatic)
      const size = config.nodeSize * (0.4 + node.energy * 1.0); // Larger size range
      
      // Color shifts based on energy level
      const color = node.energy > 0.5 ? config.accentColor : config.primaryColor;

      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(node.position.x, node.position.y, size, 0, Math.PI * 2);
      this.ctx.fill();

      // Inner highlight for highly energetic nodes (more visible)
      if (node.energy > 0.6) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + node.energy * 0.4})`;
        this.ctx.beginPath();
        this.ctx.arc(
          node.position.x - size * 0.3,
          node.position.y - size * 0.3,
          size * 0.3,
          0,
          Math.PI * 2
        );
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    this.ctx.globalAlpha = 1.0;
  }

  protected onDestroy(): void {
    this.nodes = [];
  }

  protected onConfigUpdate(_config: Partial<VisualModuleConfig>): void {
    this.initializeNetwork();
  }

  protected onReset(): void {
    this.initializeNetwork();
  }

  protected onResize(_width: number, _height: number): void {
    this.initializeNetwork();
  }

  // Helper methods
  private distance(a: Vector2D, b: Vector2D): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Handle user interactions - trigger activation at touch point
   */
  protected onInteraction(event: InteractionEvent): void {
    if (!this.nodes) return;

    if (event.type === 'tap' || event.type === 'pointerdown' || event.type === 'drag') {
      // Find nearest node to interaction point
      let nearestNode = null;
      let nearestDist = Infinity;
      let nearestIndex = -1;

      for (let i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];
        const dist = this.distance(node.position, event.point);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestNode = node;
          nearestIndex = i;
        }
      }

      // Activate the nearest node and nearby nodes
      if (nearestNode) {
        const activationRadius = 100;
        for (const node of this.nodes) {
          const dist = this.distance(node.position, nearestNode.position);
          if (dist <= activationRadius) {
            const strength = 1 - (dist / activationRadius);
            node.energy = Math.min(1, node.energy + strength);
          }
        }

        // Emit event for audio synchronization
        this.emitEvent({
          type: 'node-activated',
          timestamp: event.timestamp,
          data: { 
            nodeId: nearestIndex,
            activationLevel: nearestNode.energy,
            connectionCount: nearestNode.connections.length,
          },
        });
      }
    }
  }
}
