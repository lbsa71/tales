/**
 * Interaction Types
 * 
 * Type definitions for user interactions with visual modules
 * (mouse and touch inputs)
 */

/**
 * Interaction point in canvas coordinates
 */
export interface InteractionPoint {
  x: number;
  y: number;
  pressure?: number; // For touch pressure sensitivity
}

/**
 * Type of interaction event
 */
export type InteractionEventType = 
  | 'pointerdown'   // Mouse click or touch start
  | 'pointermove'   // Mouse move or touch move
  | 'pointerup'     // Mouse release or touch end
  | 'tap'           // Quick tap/click
  | 'drag'          // Dragging motion
  | 'hover';        // Hovering (mouse only)

/**
 * Interaction event data
 */
export interface InteractionEvent {
  type: InteractionEventType;
  point: InteractionPoint;
  timestamp: number;
  isTouch: boolean;
  velocity?: { x: number; y: number }; // For drag events
}

/**
 * Interaction state tracking
 */
export interface InteractionState {
  isActive: boolean;
  currentPoint: InteractionPoint | null;
  lastPoint: InteractionPoint | null;
  startPoint: InteractionPoint | null;
  startTime: number;
  isDragging: boolean;
  velocity: { x: number; y: number };
}
