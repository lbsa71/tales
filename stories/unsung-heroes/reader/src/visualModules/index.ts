/**
 * Visual Modules - Main Export
 * 
 * Exports all visual modules, components, hooks, and types.
 */

// Types
export * from './VisualModuleTypes';
export * from './InteractionTypes';

// Base classes
export { BaseVisualModule } from './BaseVisualModule';

// Orchestrator
export { VisualModuleOrchestrator } from './VisualModuleOrchestrator';

// Modules
export { DLAModule } from './modules/DLAModule';
export { ReactionDiffusionModule } from './modules/ReactionDiffusionModule';
export { LSystemModule } from './modules/LSystemModule';
export { CellularAutomataModule } from './modules/CellularAutomataModule';
export { MorphogeneticModule } from './modules/MorphogeneticModule';
export { BoidsModule } from './modules/BoidsModule';
export { ForceDirectedGraphModule } from './modules/ForceDirectedGraphModule';
export { NeuralActivationModule } from './modules/NeuralActivationModule';
export { SuccessorModule } from './modules/SuccessorModule';

// React components
export { VisualCanvas } from './components/VisualCanvas';

// React hooks
export { useVisualModule } from './hooks/useVisualModule';

// Configuration
import visualConfig from './config/visualConfig.json';
export { visualConfig };
