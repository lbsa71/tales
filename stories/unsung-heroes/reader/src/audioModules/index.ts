/**
 * Audio Modules Export
 * 
 * Central export point for all audio modules in the Unsung Heroes interactive reader.
 */

// Type exports
export type {
  AudioModule,
  AudioModuleConfig,
  FilteredNoiseConfig,
  GranularCloudConfig,
  SparseFMConfig,
  MicrosoundConfig,
  AdditiveDroneConfig,
  StereoShiftConfig,
  SyntheticChimesConfig,
  NeuralSonificationConfig,
  HyperlowRumbleConfig,
  ModuleConfigEntry,
  GlobalConfig,
  TransitionConfig,
  AudioConfig,
  PerformanceMetrics,
  ModuleState,
} from './AudioModuleTypes';

// Base class export
export { BaseAudioModule } from './BaseAudioModule';

// Orchestrator export
export { AudioModuleOrchestrator } from './AudioModuleOrchestrator';

// Individual module exports
export { FilteredNoiseModule } from './modules/FilteredNoiseModule';
export { GranularCloudModule } from './modules/GranularCloudModule';
export { SparseFMModule } from './modules/SparseFMModule';
export { MicrosoundModule } from './modules/MicrosoundModule';
export { AdditiveDroneModule } from './modules/AdditiveDroneModule';
export { StereoShiftModule } from './modules/StereoShiftModule';
export { SyntheticChimesModule } from './modules/SyntheticChimesModule';
export { NeuralSonificationModule } from './modules/NeuralSonificationModule';
export { HyperlowRumbleModule } from './modules/HyperlowRumbleModule';

// Component exports
export { AudioControl } from './components/AudioControl';

// Hook exports
export { useAudioModule } from './hooks/useAudioModule';
export { useIOSAudioUnlock } from './hooks/useIOSAudioUnlock';

// Configuration export
import audioConfigData from './config/audioConfig.json';
import type { AudioConfig } from './AudioModuleTypes';
export const audioConfig = audioConfigData as AudioConfig;
