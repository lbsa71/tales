/**
 * Audio Module Types
 * 
 * Type definitions and interfaces for the generative audio modules
 * in the Unsung Heroes interactive reader.
 */

/**
 * Base configuration for all audio modules
 */
export interface AudioModuleConfig {
  // Volume and mixing
  masterGain: number;         // 0.0 - 1.0 (maps to dB range)
  panWidth: number;           // 0.0 - 1.0 (stereo width)
  
  // Frequency shaping
  lowCutoff: number;          // Hz (high-pass filter)
  highCutoff: number;         // Hz (low-pass filter)
  
  // Behavioral parameters
  density: number;            // 0.0 - 1.0 (sparse to dense)
  complexity: number;         // 0.0 - 1.0 (simple to complex)
  
  // Module-specific parameters (extended by individual modules)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Core interface that all audio modules must implement
 */
export interface AudioModule {
  // Lifecycle methods
  init(audioContext: AudioContext, config: AudioModuleConfig): void;
  start(): void;
  stop(): void;
  destroy(): void;
  
  // Configuration
  updateConfig(config: Partial<AudioModuleConfig>): void;
  getConfig(): AudioModuleConfig;
  
  // State control
  pause(): void;
  resume(): void;
  fadeIn(duration: number): void;
  fadeOut(duration: number): void;
  
  // Performance and state
  getMetrics(): PerformanceMetrics;
  getState(): ModuleState;
}

/**
 * Filtered Noise Module specific configuration
 */
export interface FilteredNoiseConfig extends AudioModuleConfig {
  noiseType: 'pink' | 'brown';
  noiseGain: number;
  filterFrequency: number;
  filterQ: number;
  filterModulationRate: number;
  filterModulationDepth: number;
  grainDensity: number;
  grainDuration: number;
  grainPitchMin: number;
  grainPitchMax: number;
  grainGain: number;
}

/**
 * Granular Cloud Module specific configuration
 */
export interface GranularCloudConfig extends AudioModuleConfig {
  minConcurrentGrains: number;
  maxConcurrentGrains: number;
  spawnRate: number;
  grainDurationMin: number;
  grainDurationMax: number;
  grainPitchMin: number;
  grainPitchMax: number;
  grainPitchVariation: number;
  stereoSpread: number;
  spatialMovement: number;
  grainShape: 'sine' | 'triangle';
  envelopeShape: 'linear' | 'gaussian';
}

/**
 * Sparse FM Module specific configuration
 */
export interface SparseFMConfig extends AudioModuleConfig {
  eventDensity: number;
  eventVariation: number;
  carrierFreqMin: number;
  carrierFreqMax: number;
  modulatorRatio: number;
  modulationIndex: number;
  attackTime: number;
  decayTime: number;
  peakGain: number;
  carrierType: 'sine' | 'triangle';
  modulatorType: 'sine' | 'triangle';
}

/**
 * Microsound Module specific configuration
 */
export interface MicrosoundConfig extends AudioModuleConfig {
  crackleRate: number;
  crackleIntensity: number;
  crackleDuration: number;
  bitDepth: number;
  bitDepthVariation: number;
  sampleRateReduction: number;
  filterFreq: number;
  panRandomization: number;
}

/**
 * Additive Drone Module specific configuration
 */
export interface AdditiveDroneConfig extends AudioModuleConfig {
  oscillatorCount: number;
  fundamentalFreq: number;
  harmonic: boolean;
  harmonicRatios: number[];
  phaseDriftRate: number;
  phaseDriftDepth: number;
  amplitudeVariation: number;
  oscillatorGains: number[];
  detuning: number;
}

/**
 * Stereo Shift Module specific configuration
 */
export interface StereoShiftConfig extends AudioModuleConfig {
  voiceCount: number;
  voiceFreqs: number[];
  voiceWaveform: 'sine' | 'triangle' | 'square';
  panRate: number;
  panDepth: number;
  panPhaseOffset: number;
  attackTime: number;
  releaseTime: number;
  filterCutoff: number;
  filterResonance: number;
}

/**
 * Synthetic Chimes Module specific configuration
 */
export interface SyntheticChimesConfig extends AudioModuleConfig {
  chimeDensity: number;
  clusterProbability: number;
  clusterSize: number;
  fundamentalFreqs: number[];
  inharmonicity: number;
  brightness: number;
  attackTime: number;
  decayTime: number;
  peakGain: number;
  stereoVariation: number;
}

/**
 * Neural Sonification Module specific configuration
 */
export interface NeuralSonificationConfig extends AudioModuleConfig {
  oscillatorCount: number;
  freqMin: number;
  freqMax: number;
  lfoCount: number;
  lfoRateMin: number;
  lfoRateMax: number;
  lfoDepth: number;
  eventProbability: number;
  eventMagnitude: number;
  oscillatorGains: number[];
}

/**
 * Hyperlow Rumble Module specific configuration
 */
export interface HyperlowRumbleConfig extends AudioModuleConfig {
  bassFreqMin: number;
  bassFreqMax: number;
  bassModRate: number;
  bassGain: number;
  glitchDensity: number;
  glitchIntensity: number;
  glitchDuration: number;
  bitDepthMin: number;
  bitDepthMax: number;
  bassGlitchBalance: number;
}

/**
 * Module configuration from JSON
 */
export interface ModuleConfigEntry {
  chapterId: number;
  moduleName: string;
  enabled: boolean;
  config: AudioModuleConfig;
}

/**
 * Global configuration settings
 */
export interface GlobalConfig {
  respectReducedMotion: boolean;
  enableAudio: boolean;
  defaultVolume: number;
  maxConcurrentModules: number;
  masterCompression: boolean;
}

/**
 * Transition configuration
 */
export interface TransitionConfig {
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * Complete audio configuration structure
 */
export interface AudioConfig {
  modules: ModuleConfigEntry[];
  transitions: TransitionConfig;
  global: GlobalConfig;
}

/**
 * Performance metrics tracking
 */
export interface PerformanceMetrics {
  cpuUsage?: number;
  memoryUsage?: number;
  activeNodes: number;
  lastUpdateTime: number;
}

/**
 * Module state
 */
export type ModuleState = 'uninitialized' | 'initializing' | 'running' | 'paused' | 'stopped' | 'destroyed';
