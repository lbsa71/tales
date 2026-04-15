/**
 * Visual Module Types
 * 
 * Type definitions and interfaces for the generative visual modules
 * in the Unsung Heroes interactive reader.
 */

/**
 * Base configuration for all visual modules
 */
export interface VisualModuleConfig {
  // Color scheme
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  opacity: number;
  
  // Animation parameters
  speed: number;          // 0.0 - 1.0 (slow to fast)
  density: number;        // 0.0 - 1.0 (sparse to dense)
  complexity: number;     // 0.0 - 1.0 (simple to complex)
  
  // Module-specific parameters (extended by individual modules)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Core interface that all visual modules must implement
 */
export interface VisualModule {
  // Lifecycle methods
  init(canvas: HTMLCanvasElement, config: VisualModuleConfig): void;
  update(deltaTime: number): void;
  render(): void;
  destroy(): void;
  
  // Configuration
  updateConfig(config: Partial<VisualModuleConfig>): void;
  getConfig(): VisualModuleConfig;
  
  // State control
  pause(): void;
  resume(): void;
  reset(): void;
}

/**
 * DLA Module specific configuration
 */
export interface DLAConfig extends VisualModuleConfig {
  particleCount: number;
  wanderSpeed: number;
  stickingDistance: number;
  branchingFactor: number;
  particleSize: number;
  glowRadius: number;
  contrast: number;
  trailLength: number;
}

/**
 * Reaction-Diffusion Module specific configuration
 */
export interface ReactionDiffusionConfig extends VisualModuleConfig {
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

/**
 * L-System Module specific configuration
 */
export interface LSystemConfig extends VisualModuleConfig {
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
 * Cellular Automata Module specific configuration
 */
export interface CellularAutomataConfig extends VisualModuleConfig {
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  birthRule: number[];
  survivalRule: number[];
  updateInterval: number;
  initialDensity: number;
  fadeInDuration: number;
  fadeOutDuration: number;
  showGrid: boolean;
  gridOpacity: number;
  cellGlow: number;
}

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
 * Module configuration from JSON
 */
export interface ModuleConfigEntry {
  chapterId: number;
  moduleName: string;
  enabled: boolean;
  config: VisualModuleConfig;
}

/**
 * Global configuration settings
 */
export interface GlobalConfig {
  respectReducedMotion: boolean;
  targetFrameRate: number;
  enablePerformanceMonitoring: boolean;
  autoAdjustQuality: boolean;
  mobileQualityReduction: number;
}

/**
 * Transition configuration
 */
export interface TransitionConfig {
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * Complete visual configuration structure
 */
export interface VisualConfig {
  modules: ModuleConfigEntry[];
  transitions: TransitionConfig;
  global: GlobalConfig;
}

/**
 * Performance metrics tracking
 */
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  lastUpdateTime: number;
}

/**
 * Module state
 */
export type ModuleState = 'uninitialized' | 'initializing' | 'running' | 'paused' | 'destroyed';
