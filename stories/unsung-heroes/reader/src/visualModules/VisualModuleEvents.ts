/**
 * Visual Module Events
 * 
 * Event types that visual modules can emit for audio synchronization
 */

/**
 * Base event interface
 */
export interface VisualModuleEvent {
  type: string;
  timestamp: number;
  chapterId?: number;
  data?: Record<string, unknown>;
}

/**
 * Event types that can be emitted
 */
export type VisualModuleEventType = 
  | 'plant-created'      // New plant/generation created (L-System)
  | 'particle-stuck'     // Particle stuck to structure (DLA)
  | 'pattern-emerged'    // Pattern emerged (Reaction-Diffusion, CA)
  | 'branch-formed'      // New branch formed (Morphogenetic)
  | 'boid-clustered'     // Boids formed a cluster
  | 'node-activated'     // Node activated (Neural, Force-Directed)
  | 'mutation-occurred'  // Mutation occurred (L-System)
  | 'generation-complete'; // Generation complete

/**
 * Plant created event (L-System specific)
 */
export interface PlantCreatedEvent extends VisualModuleEvent {
  type: 'plant-created';
  data: {
    generationIndex: number;
    segmentCount: number;
    rules: Record<string, string>;
  };
}

/**
 * Node activated event (Force-Directed Graph specific)
 */
export interface NodeActivatedEvent extends VisualModuleEvent {
  type: 'node-activated';
  data: {
    nodeId: number;
    activationLevel: number;
    connectionCount: number;
  };
}

/**
 * Event emitter interface
 */
export interface VisualModuleEventEmitter {
  emit(event: VisualModuleEvent): void;
  on(eventType: VisualModuleEventType, callback: (event: VisualModuleEvent) => void): void;
  off(eventType: VisualModuleEventType, callback: (event: VisualModuleEvent) => void): void;
}

