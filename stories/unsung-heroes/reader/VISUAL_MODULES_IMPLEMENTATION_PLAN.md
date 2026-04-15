# Visual Modules Implementation Plan

## Overview

This document outlines the implementation strategy for adding generative visual modules to the Unsung Heroes interactive reader. Each evolutionary rung (chapter) will have a corresponding visual module that creates an atmospheric, meditative background animation reflecting the chapter's themes.

## Project Context

- **Repository**: lbsa71/unsung-heroes
- **Application**: React/TypeScript interactive reader using Vite
- **Current State**: Text-based reader with subtle background gradients and ghost layers
- **Goal**: Add generative visual backgrounds that enhance each chapter's atmosphere without distracting from the text

## Architecture Overview

### Visual Module Interface

Each visual module will be a self-contained TypeScript class implementing a common interface:

```typescript
interface VisualModuleConfig {
  // Color scheme
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  opacity: number;
  
  // Animation parameters
  speed: number;          // 0.0 - 1.0 (slow to fast)
  density: number;        // 0.0 - 1.0 (sparse to dense)
  complexity: number;     // 0.0 - 1.0 (simple to complex)
  
  // Behavioral parameters (module-specific)
  [key: string]: any;
}

interface VisualModule {
  // Lifecycle methods
  init(canvas: HTMLCanvasElement, config: VisualModuleConfig): void;
  update(deltaTime: number): void;
  render(): void;
  destroy(): void;
  
  // Configuration
  updateConfig(config: Partial<VisualModuleConfig>): void;
  getConfig(): VisualModuleConfig;
  
  // State
  pause(): void;
  resume(): void;
  reset(): void;
}
```

### Directory Structure

```
reader/
├── src/
│   ├── visualModules/
│   │   ├── index.ts                    # Export all modules
│   │   ├── BaseVisualModule.ts         # Abstract base class
│   │   ├── VisualModuleTypes.ts        # TypeScript interfaces
│   │   ├── VisualModuleOrchestrator.ts # Lifecycle management
│   │   ├── modules/
│   │   │   ├── DLAModule.ts            # Rung 1: Diffusion-Limited Aggregation
│   │   │   ├── ReactionDiffusionModule.ts  # Rung 2: Turing Patterns
│   │   │   ├── LSystemModule.ts        # Rung 3: L-systems
│   │   │   ├── CellularAutomataModule.ts   # Rung 4: Conway's Life variant
│   │   │   ├── MorphogeneticModule.ts  # Rung 5: Space Colonization
│   │   │   ├── BoidsModule.ts          # Rung 6: Flocking simulation
│   │   │   ├── ForceDirectedGraphModule.ts # Rung 7: Semantic network
│   │   │   ├── NeuralActivationModule.ts   # Rung 8: Activation grids
│   │   │   └── SuccessorModule.ts      # Rung 9: Hyperbolic/quasicrystal
│   │   └── config/
│   │       └── visualConfig.json       # Configuration for each rung
│   ├── components/
│   │   └── VisualCanvas.tsx            # React component wrapper
│   └── hooks/
│       └── useVisualModule.ts          # React hook for module lifecycle
```

## Implementation Phases

### Phase 1: Foundation (Week 1) ✅ COMPLETE

**Goal**: Establish the architecture and create base classes

- [x] Create project structure and directories
- [x] Define TypeScript interfaces (`VisualModuleTypes.ts`)
- [x] Implement `BaseVisualModule` abstract class
- [x] Create `VisualModuleOrchestrator` for lifecycle management
- [x] Implement `VisualCanvas` React component
- [x] Create `useVisualModule` React hook
- [x] Set up configuration JSON structure
- [ ] Write unit tests for base classes

**Deliverables**:
- ✅ Complete type system
- ✅ Base class with common functionality (canvas management, requestAnimationFrame loop)
- ✅ Orchestrator with load/unload capabilities
- ✅ React integration components

### Phase 2: Core Modules (Week 2-3) 🔄 RUNGS 1-4 COMPLETE

**Goal**: Implement the first 5 visual modules (simpler algorithms)

#### Rung 1: Diffusion-Limited Aggregation (DLA) ✅ COMPLETE
- **File**: `DLAModule.ts` ✅ Implemented
- **Algorithm**: Particle random walk with aggregation on contact
- **Parameters**:
  - `particleCount`: number of particles (10-50)
  - `wanderSpeed`: slow drift velocity (0.1-0.5)
  - `branchingFactor`: probability of branching (0.6-0.9)
  - `contrast`: low contrast (0.2-0.4)
- **Visual characteristics**:
  - Slow, organic branching patterns
  - Particles aggregate into dendritic structures
  - Very subtle, almost imperceptible movement
  - Dark background with faint golden particles
- **Status**: ✅ Implementation complete, includes spatial grid optimization

#### Rung 2: Reaction-Diffusion (Turing Patterns) ✅ COMPLETE
- **File**: `ReactionDiffusionModule.ts` ✅ Implemented
- **Algorithm**: Gray-Scott reaction-diffusion system
- **Parameters**:
  - `feedRate`: 0.037-0.060
  - `killRate`: 0.058-0.065
  - `diffusionA`: 1.0
  - `diffusionB`: 0.5
  - `timeStep`: 0.5-1.0
- **Visual characteristics**:
  - Slowly morphing spots and stripes
  - Smooth, organic transitions
  - Soft cyan-green color palette
  - Represents membrane boundaries
- **Status**: ✅ Implementation complete with 9-point Laplacian stencil

#### Rung 3: L-Systems ✅ COMPLETE
- **File**: `LSystemModule.ts` ✅ Implemented
- **Algorithm**: Lindenmayer system with turtle graphics
- **Parameters**:
  - `axiom`: Starting string (e.g., "F")
  - `rules`: Production rules (e.g., F → F+F-F-F+F)
  - `angle`: Branching angle (25-30 degrees)
  - `iterations`: Recursion depth (3-5)
  - `mutationRate`: 0.01-0.05
- **Visual characteristics**:
  - Recursive fractal growth patterns
  - Periodic small mutations in branching
  - Gentle rotation or swaying
  - Olive-green tones
- **Status**: ✅ Implementation complete with mutation system and swaying animation

#### Rung 4: Cellular Automata ✅ COMPLETE
- **File**: `CellularAutomataModule.ts` ✅ Implemented
- **Algorithm**: Conway's Game of Life or variant (HighLife, Seeds)
- **Parameters**:
  - `gridSize`: 40x30 (sparse)
  - `cellSize`: 15-20 pixels
  - `updateRate`: 500-1000ms (slow)
  - `initialDensity`: 0.1-0.2 (sparse)
  - `rules`: B3/S23 (classic Life) or B36/S23 (HighLife)
- **Visual characteristics**:
  - Simple grid with minimal cell density
  - Gliders, blinkers, stable patterns
  - Very slow updates to avoid distraction
  - Dark teal background
- **Status**: ✅ Implementation complete with fade transitions and pattern seeding

#### Rung 5: Morphogenetic Growth ⏳ PENDING
- **File**: `MorphogeneticModule.ts`
- **Algorithm**: Space Colonization Algorithm
- **Parameters**:
  - `attractorCount`: 100-200
  - `segmentLength`: 5-10 pixels
  - `influenceRadius`: 50-100 pixels
  - `killRadius`: 10-20 pixels
  - `growthRate`: slow (1-2 segments per second)
- **Visual characteristics**:
  - Branching tendrils seeking attractors
  - Vascular, tree-like patterns
  - Gentle grow/fade cycles
  - Purple tones for complexity

### Phase 3: Advanced Modules (Week 4)

**Goal**: Implement the more complex visual modules

#### Rung 6: Flocking Simulation (Boids)
- **File**: `BoidsModule.ts`
- **Algorithm**: Reynolds' boids with separation, alignment, cohesion
- **Parameters**:
  - `boidCount`: 20-40
  - `separationRadius`: 25-40 pixels
  - `alignmentRadius`: 50-75 pixels
  - `cohesionRadius`: 75-100 pixels
  - `maxSpeed`: 1-2 pixels per frame
  - `maxForce`: 0.05-0.1
- **Visual characteristics**:
  - Cohesive flock movement
  - Occasional group direction shifts
  - Subtle trails or motion blur
  - Magenta tones for sentience

#### Rung 7: Force-Directed Graph
- **File**: `ForceDirectedGraphModule.ts`
- **Algorithm**: Force-directed graph layout (Fruchterman-Reingold or similar)
- **Parameters**:
  - `nodeCount`: 15-25
  - `edgeDensity`: 0.15-0.25
  - `repulsionForce`: 1000-2000
  - `attractionForce`: 0.01-0.05
  - `damping`: 0.85-0.95
- **Visual characteristics**:
  - Floating nodes with soft connecting lines
  - Clustering and reorganizing
  - Calm, cerebral aesthetic
  - Blue tones for abstraction

#### Rung 8: Neural Activation Field
- **File**: `NeuralActivationModule.ts`
- **Algorithm**: Grid-based activation propagation or t-SNE-like clustering
- **Parameters**:
  - `gridSize`: 20x20 or point cluster
  - `activationDecay`: 0.95-0.98
  - `propagationSpeed`: medium
  - `clusterCount`: 5-8
  - `activationThreshold`: 0.3-0.5
- **Visual characteristics**:
  - Grid or point cluster with activation waves
  - Shifting intensity patterns
  - More precise/clean than earlier visuals
  - Darker background (original dark theme)

#### Rung 9: Successor (Non-representable)
- **File**: `SuccessorModule.ts`
- **Algorithm**: Hyperbolic tiling, Penrose/quasicrystal, or 4D CA projected to 2D
- **Parameters**:
  - Algorithm choice: "hyperbolic" | "quasicrystal" | "higherDimCA"
  - `instabilityFactor`: 0.1-0.3 (introduces glitches)
  - `dissolveTime`: 5-10 seconds at end
  - Uncanny visual parameters
- **Visual characteristics**:
  - Feels alien and non-human
  - Introduces subtle glitches and instability
  - Fades out abruptly at chapter end
  - Darkest background, mysterious tones

### Phase 4: Integration (Week 5)

**Goal**: Integrate modules into the Reader component

- [ ] Update `Reader.tsx` to include visual canvas layer
- [ ] Implement chapter-to-module mapping in configuration
- [ ] Add orchestrator to manage module lifecycle during transitions
- [ ] Ensure smooth transitions between modules
- [ ] Implement proper cleanup to prevent memory leaks
- [ ] Add loading states and error handling
- [ ] Create performance monitoring

**Integration Points**:
1. Add canvas layer behind text content
2. Load appropriate module based on `currentChapterIndex`
3. Coordinate fade transitions with text transitions
4. Handle pause/resume on user interaction
5. Ensure accessibility (reduced motion preferences)

### Phase 5: Polish & Optimization (Week 6)

**Goal**: Performance optimization and final touches

- [ ] Performance profiling and optimization
- [ ] Memory leak detection and prevention
- [ ] Mobile responsiveness testing
- [ ] Accessibility improvements
- [ ] Configuration fine-tuning
- [ ] Documentation
- [ ] User testing and feedback
- [ ] Final polish

## Technical Specifications

### Canvas Management

Each module will render to an HTML5 Canvas element:
- **Resolution**: Match window size with devicePixelRatio for crisp rendering
- **Rendering loop**: RequestAnimationFrame-based
- **Layering**: Canvas positioned absolutely behind text content (z-index < 10)
- **Opacity**: Configurable per module (typically 0.3-0.6)

### Performance Considerations

- **Target framerate**: 30-60 fps
- **Canvas updates**: Use requestAnimationFrame
- **Memory management**: Proper cleanup in destroy()
- **Mobile optimization**: Reduce complexity on mobile devices
- **Reduced motion**: Respect prefers-reduced-motion media query

### Color Scheme Integration

Each module uses colors from the existing `themeColor` in `chaptersData.ts`:
1. Replicators: `#1a1408` (dark gold)
2. Protocells: `#0a120e` (dark cyan-green)
3. RNA Organisms: `#0e140a` (dark olive-green)
4. Early Cells: `#0a100f` (dark teal)
5. Multicellular: `#0f0a14` (dark purple)
6. Sentient Animals: `#140a0f` (dark magenta)
7. Humans: `#0a0e14` (dark blue)
8. The Pattern: `#0a0a0f` (original dark)

### Configuration JSON Structure

```json
{
  "modules": [
    {
      "chapterId": 1,
      "moduleName": "DLA",
      "enabled": true,
      "config": {
        "primaryColor": "#c89b5c",
        "secondaryColor": "#8b6f47",
        "accentColor": "#ffd700",
        "opacity": 0.3,
        "speed": 0.2,
        "density": 0.3,
        "complexity": 0.4,
        "particleCount": 30,
        "wanderSpeed": 0.3,
        "branchingFactor": 0.75,
        "contrast": 0.3
      }
    },
    // ... additional chapters
  ],
  "global": {
    "transitionDuration": 1200,
    "respectReducedMotion": true,
    "enablePerformanceMonitoring": true
  }
}
```

## Testing Strategy

### Unit Tests
- Test each module's lifecycle methods
- Test configuration updates
- Test pause/resume functionality
- Test cleanup (no memory leaks)

### Integration Tests
- Test orchestrator module switching
- Test smooth transitions
- Test canvas sizing and responsiveness
- Test performance under various conditions

### Visual/Manual Tests
- Verify visual aesthetic matches chapter themes
- Check for distracting animations
- Validate color schemes
- Test on multiple devices and screen sizes
- Verify accessibility features

## Dependencies

### New Dependencies (to be added)
None required - vanilla Canvas API and existing dependencies sufficient

### Existing Dependencies (already in package.json)
- React 19
- TypeScript 5.9
- Vite (rolldown-vite)

## Accessibility Considerations

1. **Reduced Motion**: Respect `prefers-reduced-motion` media query
   - Disable or significantly reduce animations
   - Provide static alternative visuals

2. **Performance**: Ensure visuals don't impact text readability
   - Keep opacity low
   - Avoid rapid flashing or strobing
   - Maintain smooth performance

3. **User Control**: Consider adding visual controls
   - Toggle visuals on/off
   - Adjust opacity
   - Pause animations

## Risk Mitigation

### Performance Risks
- **Risk**: Complex algorithms may cause performance issues on mobile
- **Mitigation**: Implement complexity scaling based on device capabilities
- **Mitigation**: Use requestIdleCallback for non-critical updates
- **Mitigation**: Implement performance monitoring and auto-adjustment

### Memory Leaks
- **Risk**: Canvas contexts and animation loops not properly cleaned up
- **Mitigation**: Strict destroy() implementation with checklist
- **Mitigation**: Use React hooks for automatic cleanup
- **Mitigation**: Memory profiling during development

### Visual Distraction
- **Risk**: Animations distract from text reading
- **Mitigation**: Low opacity (0.3-0.5)
- **Mitigation**: Slow, gentle animations
- **Mitigation**: User testing and iteration
- **Mitigation**: Easy toggle to disable

### Browser Compatibility
- **Risk**: Canvas features may not work in all browsers
- **Mitigation**: Use widely supported Canvas 2D API
- **Mitigation**: Graceful degradation to gradient backgrounds
- **Mitigation**: Browser feature detection

## Success Criteria

### Functional Requirements
- ✅ All 9 visual modules implemented and working
- ✅ Smooth transitions between chapters/modules
- ✅ No memory leaks or performance degradation
- ✅ Configuration system working correctly
- ✅ Proper lifecycle management

### Visual Requirements
- ✅ Each module reflects its chapter's theme
- ✅ Visuals enhance atmosphere without distraction
- ✅ Color schemes consistent with chapter themes
- ✅ Smooth, meditative aesthetic maintained

### Performance Requirements
- ✅ Maintains 30+ fps on desktop
- ✅ Maintains 20+ fps on mobile
- ✅ No memory growth over time
- ✅ Canvas rendering doesn't block text rendering

### Accessibility Requirements
- ✅ Respects prefers-reduced-motion
- ✅ Doesn't interfere with text readability
- ✅ Works on screens of all sizes

## Timeline

- **Week 1**: Foundation (architecture, base classes, React integration)
- **Week 2**: Core modules 1-3 (DLA, Reaction-Diffusion, L-Systems)
- **Week 3**: Core modules 4-5 (Cellular Automata, Morphogenetic Growth)
- **Week 4**: Advanced modules 6-9 (Boids, Force-Directed, Neural, Successor)
- **Week 5**: Integration with Reader component
- **Week 6**: Polish, optimization, testing, documentation

**Total estimated time**: 6 weeks

## Next Steps

1. Review and approve this implementation plan
2. Set up project structure and directories
3. Begin Phase 1: Foundation implementation
4. Create initial TypeScript interfaces
5. Implement BaseVisualModule class
6. Create first prototype module (DLA) to validate architecture

## References

### Algorithms
- **DLA**: Witten & Sander (1981) - Diffusion-Limited Aggregation
- **Reaction-Diffusion**: Gray & Scott (1984) - Autocatalytic reactions
- **L-Systems**: Lindenmayer (1968) - Developmental biology models
- **Cellular Automata**: Conway (1970) - Game of Life
- **Space Colonization**: Runions et al. (2007) - Modeling trees
- **Boids**: Reynolds (1987) - Flocking behavior
- **Force-Directed Graphs**: Fruchterman & Reingold (1991)
- **t-SNE**: van der Maaten & Hinton (2008)
- **Hyperbolic Geometry**: Poincaré disk model
- **Quasicrystals**: Penrose tilings (1974)

### Visual Design
- Calm Technology principles (Weiser & Brown, 1996)
- Ambient information visualization
- Meditative interface design

## Appendix: Example Module Structure

```typescript
// Example: DLAModule.ts
import { BaseVisualModule } from '../BaseVisualModule';
import { VisualModuleConfig } from '../VisualModuleTypes';

interface DLAConfig extends VisualModuleConfig {
  particleCount: number;
  wanderSpeed: number;
  branchingFactor: number;
  contrast: number;
}

export class DLAModule extends BaseVisualModule {
  private particles: Particle[] = [];
  private aggregated: Point[] = [];
  
  init(canvas: HTMLCanvasElement, config: DLAConfig): void {
    super.init(canvas, config);
    this.initializeParticles();
    this.seedAggregation();
  }
  
  update(deltaTime: number): void {
    if (this.isPaused) return;
    
    this.particles.forEach(particle => {
      particle.randomWalk(this.config.wanderSpeed);
      if (this.checkAggregation(particle)) {
        this.aggregated.push(particle.position);
        this.resetParticle(particle);
      }
    });
  }
  
  render(): void {
    this.clearCanvas();
    this.renderAggregated();
    this.renderParticles();
  }
  
  destroy(): void {
    this.particles = [];
    this.aggregated = [];
    super.destroy();
  }
  
  // ... implementation details
}
```

---

**Document Version**: 1.0  
**Created**: 2025-12-03  
**Author**: GitHub Copilot  
**Status**: Draft - Awaiting Review
