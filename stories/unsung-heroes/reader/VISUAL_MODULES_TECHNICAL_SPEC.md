# Visual Modules Technical Specification

## Document Purpose

This document provides detailed technical specifications for each visual module in the Unsung Heroes interactive reader. It serves as a reference for implementation, defining exact algorithms, parameters, and visual characteristics.

## Module Specifications

### Rung 1: Diffusion-Limited Aggregation (DLA)

**Visual Theme**: Pre-cellular replicators - Chemical persistence through aggregation

#### Algorithm Details

**Core Concept**: Particles perform random walks until they contact an aggregated structure, at which point they stick and become part of the structure.

**Initialization**:
1. Create seed point(s) at center or specific locations
2. Spawn particles at random positions at edge of simulation area
3. Initialize aggregation grid for fast collision detection

**Update Loop**:
```
For each free particle:
  1. Apply random walk (Brownian motion)
  2. Check proximity to aggregated particles
  3. If within sticking distance:
     - Add to aggregated structure
     - Spawn new particle at edge
  4. If particle drifts too far, respawn at edge
```

**Rendering**:
- Aggregated particles: slightly larger, brighter
- Free particles: smaller, dimmer, trailing effect
- Use radial gradient for soft glow

#### Parameters

```typescript
interface DLAConfig {
  // Visual
  primaryColor: string;      // "#c89b5c" (warm gold)
  secondaryColor: string;    // "#8b6f47" (darker gold)
  accentColor: string;       // "#ffd700" (highlight gold)
  opacity: number;           // 0.3 (subtle)
  
  // Simulation
  particleCount: number;     // 30 (sparse)
  wanderSpeed: number;       // 0.3 (slow drift)
  stickingDistance: number;  // 3-5 pixels
  branchingFactor: number;   // 0.75 (high branching probability)
  
  // Aesthetics
  particleSize: number;      // 2-4 pixels
  glowRadius: number;        // 8-12 pixels
  contrast: number;          // 0.3 (low)
  trailLength: number;       // 3-5 frames
}
```

#### Acceptance Criteria
- ✅ Slow particle wandering (barely perceptible movement)
- ✅ Organic branching patterns emerge
- ✅ Low contrast (doesn't distract from text)
- ✅ Dendritic structures form over time
- ✅ Warm, primordial color palette

#### Performance Notes
- Use spatial grid for O(1) collision detection
- Limit particles to 30-50 maximum
- Update at 30 fps, render at 60 fps

---

### Rung 2: Reaction-Diffusion (Turing Patterns)

**Visual Theme**: Protocell membranes - Boundary control through chemical reactions

#### Algorithm Details

**Core Concept**: Gray-Scott reaction-diffusion system creates organic patterns resembling cell membranes and biological structures.

**Equations**:
```
∂A/∂t = DA∇²A - AB² + f(1-A)
∂B/∂t = DB∇²B + AB² - (k+f)B

Where:
- A, B are chemical concentrations
- DA, DB are diffusion rates
- f is feed rate
- k is kill rate
- ∇² is Laplacian operator
```

**Initialization**:
1. Create 2D grid (128x128 or 256x256)
2. Initialize A=1.0, B=0.0 everywhere
3. Add small random perturbations or seed patterns
4. Pre-compute diffusion kernel for performance

**Update Loop**:
```
For each cell (i,j):
  1. Compute Laplacian for A and B
  2. Apply reaction-diffusion equations
  3. Update concentrations
  4. Clamp values to [0,1]
```

**Rendering**:
- Map concentration to color gradient (cyan-green)
- Use smooth interpolation
- Apply subtle animation (slow drift)

#### Parameters

```typescript
interface ReactionDiffusionConfig {
  // Visual
  primaryColor: string;      // "#4a9e8e" (cyan-green)
  secondaryColor: string;    // "#2d6a5f" (darker teal)
  accentColor: string;       // "#7fcdbb" (light cyan)
  opacity: number;           // 0.4
  
  // Gray-Scott parameters
  feedRate: number;          // 0.037-0.060 (determines pattern)
  killRate: number;          // 0.058-0.065 (determines pattern)
  diffusionA: number;        // 1.0 (standard)
  diffusionB: number;        // 0.5 (half of A)
  timeStep: number;          // 0.8 (stability)
  
  // Grid
  gridWidth: number;         // 256
  gridHeight: number;        // 256
  
  // Aesthetics
  colorIntensity: number;    // 0.6
  smoothing: number;         // 0.9 (interpolation factor)
  driftSpeed: number;        // 0.1 (slow morphing)
}
```

#### Pattern Presets
- **Spots**: f=0.055, k=0.062
- **Stripes**: f=0.037, k=0.060
- **Waves**: f=0.014, k=0.054
- **Mixed**: f=0.046, k=0.063

#### Acceptance Criteria
- ✅ Slowly morphing spots/stripes
- ✅ Smooth transitions (no jarring changes)
- ✅ Soft contrast
- ✅ Organic, membrane-like appearance
- ✅ Cyan-green color palette

#### Performance Notes
- Use WebGL if available for GPU acceleration
- Fall back to optimized CPU implementation
- Update at 15-30 fps (patterns change slowly)
- Consider lower resolution grid on mobile

---

### Rung 3: L-Systems (Branching Recursion)

**Visual Theme**: RNA-world replication - Recursive growth patterns

#### Algorithm Details

**Core Concept**: Lindenmayer systems use string rewriting to create fractal plant-like structures.

**Grammar Rules**:
```
Axiom: F
Rules: 
  F → F[+F]F[-F]F  (branching)
  F → F[+F][-F]    (simpler branching)
Angle: 25-30 degrees
```

**Turtle Graphics Interpretation**:
- F: Draw forward
- +: Turn right by angle
- -: Turn left by angle
- [: Push position/angle to stack
- ]: Pop position/angle from stack

**Initialization**:
1. Set axiom string
2. Apply production rules N times (3-5 iterations)
3. Generate final instruction string
4. Convert to geometry

**Update Loop**:
```
Every N seconds:
  1. Randomly mutate a production rule slightly
  2. Regenerate geometry
  3. Smoothly transition from old to new
  4. Apply gentle rotation or swaying
```

**Rendering**:
- Draw lines with gradient thickness
- Apply subtle glow
- Fade in new growth

#### Parameters

```typescript
interface LSystemConfig {
  // Visual
  primaryColor: string;      // "#8b9a5b" (olive-green)
  secondaryColor: string;    // "#5a6b3c" (darker olive)
  accentColor: string;       // "#b8c689" (light olive)
  opacity: number;           // 0.35
  
  // L-System
  axiom: string;             // "F"
  rules: Record<string, string>; // { "F": "F[+F]F[-F]F" }
  angle: number;             // 25 (degrees)
  iterations: number;        // 4
  
  // Mutation
  mutationRate: number;      // 0.02 (2% chance per interval)
  mutationInterval: number;  // 8000ms
  
  // Aesthetics
  lineWidth: number;         // 1-3 pixels
  segmentLength: number;     // 5-8 pixels
  glowIntensity: number;     // 0.4
  swayAmplitude: number;     // 2-3 degrees
  swayFrequency: number;     // 0.1 Hz
}
```

#### Example Rules
- **Bush**: F → F[+F]F[-F]F
- **Tree**: F → FF+[+F-F-F]-[-F+F+F]
- **Fern**: X → F+[[X]-X]-F[-FX]+X, F → FF

#### Acceptance Criteria
- ✅ Recursive fractal growth
- ✅ Periodic small mutations (every 8-10 seconds)
- ✅ Gentle motion (swaying or rotation)
- ✅ Organic, plant-like appearance
- ✅ Olive-green color palette

#### Performance Notes
- Pre-compute geometry, only update on mutation
- Limit total segment count to ~500-1000
- Cache transformed coordinates
- Use requestAnimationFrame for smooth sway

---

### Rung 4: Cellular Automata (Conway's Life Variant)

**Visual Theme**: Early cell ecosystems - Simple rules, emergent behavior

#### Algorithm Details

**Core Concept**: Grid-based system where cells live or die based on neighbor count.

**Conway's Game of Life Rules** (B3/S23):
- Birth: Dead cell with exactly 3 neighbors becomes alive
- Survival: Live cell with 2 or 3 neighbors survives
- Death: All other cases

**Alternative: HighLife** (B36/S23):
- Birth: Dead cell with 3 or 6 neighbors becomes alive
- Survival: Live cell with 2 or 3 neighbors survives
- Creates interesting replicators

**Initialization**:
1. Create sparse grid (40x30 cells)
2. Random initialization (10-20% density)
3. Optional: Seed with known stable patterns

**Update Loop**:
```
Every updateInterval (500-1000ms):
  1. For each cell, count live neighbors
  2. Apply rules to determine next state
  3. Update all cells simultaneously
  4. Render with smooth interpolation
```

**Rendering**:
- Cells fade in/out smoothly
- Use gradient for cell appearance
- Show grid faintly

#### Parameters

```typescript
interface CellularAutomataConfig {
  // Visual
  primaryColor: string;      // "#5a9b8e" (teal)
  secondaryColor: string;    // "#3a6b5e" (dark teal)
  accentColor: string;       // "#8dc5ba" (light teal)
  opacity: number;           // 0.4
  
  // Grid
  gridWidth: number;         // 40 cells
  gridHeight: number;        // 30 cells
  cellSize: number;          // 15-20 pixels
  
  // Rules
  birthRule: number[];       // [3] or [3,6] for HighLife
  survivalRule: number[];    // [2,3]
  
  // Simulation
  updateInterval: number;    // 800ms (slow)
  initialDensity: number;    // 0.15 (sparse)
  
  // Aesthetics
  fadeInDuration: number;    // 200ms
  fadeOutDuration: number;   // 400ms
  showGrid: boolean;         // true (faint)
  gridOpacity: number;       // 0.1
  cellGlow: number;          // 0.3
}
```

#### Pattern Seeding
Optionally seed with classic patterns:
- **Glider**: Small moving pattern
- **Blinker**: Oscillator (period 2)
- **Toad**: Oscillator (period 2)
- **Block**: Still life

#### Acceptance Criteria
- ✅ Simple grid visualization
- ✅ Gliders, blinkers, small stable forms
- ✅ Sparse and slow (not distracting)
- ✅ Smooth fade transitions
- ✅ Teal color palette

#### Performance Notes
- Use double buffering
- Only update visible region
- Limit grid size for performance
- Pre-allocate arrays

---

### Rung 5: Morphogenetic Growth (Space Colonization)

**Visual Theme**: Multicellular specialization - Vascular branching patterns

#### Algorithm Details

**Core Concept**: Growing network reaches toward attractor points, creating organic tree-like structures.

**Algorithm Steps**:
```
Initialization:
  1. Place attractor points randomly in space
  2. Create root node(s) at bottom/center
  
Each iteration:
  1. For each attractor:
     - Find closest node within influence radius
     - Add attraction force from node to attractor
  2. For each node with attraction forces:
     - Average all forces
     - Create new node in that direction
     - Add to network
  3. Remove attractors within kill radius of nodes
  4. If no attractors remain, growth complete
```

**Rendering**:
- Draw branches as connected line segments
- Vary thickness by hierarchy (thicker at base)
- Apply gradient along length
- Subtle pulse or growth animation

#### Parameters

```typescript
interface MorphogeneticConfig {
  // Visual
  primaryColor: string;      // "#9b6a9e" (purple)
  secondaryColor: string;    // "#6b4a6e" (dark purple)
  accentColor: string;       // "#c89ac8" (light purple)
  opacity: number;           // 0.4
  
  // Space Colonization
  attractorCount: number;    // 150
  segmentLength: number;     // 7 pixels
  influenceRadius: number;   // 80 pixels
  killRadius: number;        // 15 pixels
  
  // Growth
  growthRate: number;        // 2 nodes per second
  maxNodes: number;          // 300
  
  // Aesthetics
  branchThicknessMin: number; // 0.5 pixels (tips)
  branchThicknessMax: number; // 3 pixels (base)
  pulseSpeed: number;        // 0.05 Hz
  pulseAmplitude: number;    // 0.1 (10% variation)
  fadeInDuration: number;    // 500ms per segment
}
```

#### Attractor Distribution
- **Circular**: Attractors in circle around roots
- **Hemi**: Attractors in upper hemisphere
- **Random**: Uniform random distribution
- **Clustered**: Gaussian clusters

#### Acceptance Criteria
- ✅ Branching tendrils seeking targets
- ✅ Vascular, tree-like patterns
- ✅ Gentle grow/fade cycles
- ✅ Organic, natural appearance
- ✅ Purple tones for complexity

#### Performance Notes
- Use spatial partitioning for attractor queries
- Batch new node creation
- Limit total node count
- Optimize line rendering (batch draw calls)

---

### Rung 6: Flocking Simulation (Boids)

**Visual Theme**: Animal behavior - Collective movement and coordination

#### Algorithm Details

**Core Concept**: Reynolds' boids algorithm simulates flocking through three simple rules.

**Three Rules**:
1. **Separation**: Steer away from nearby boids
2. **Alignment**: Steer toward average heading of nearby boids
3. **Cohesion**: Steer toward average position of nearby boids

**Algorithm**:
```
For each boid:
  1. Find neighbors within perception radius
  2. Compute separation force (repulsion)
  3. Compute alignment force (velocity matching)
  4. Compute cohesion force (attraction to center)
  5. Apply weighted forces to acceleration
  6. Update velocity (limit to max speed)
  7. Update position
  8. Wrap or bounce at boundaries
```

**Rendering**:
- Draw boids as small triangles or dots
- Optional: motion blur or trailing effect
- Show subtle connection lines between nearby boids

#### Parameters

```typescript
interface BoidsConfig {
  // Visual
  primaryColor: string;      // "#c86a9e" (magenta)
  secondaryColor: string;    // "#984a7e" (dark magenta)
  accentColor: string;       // "#e89ac8" (light magenta)
  opacity: number;           // 0.35
  
  // Boids
  boidCount: number;         // 30
  boidSize: number;          // 3-5 pixels
  
  // Behavior
  separationRadius: number;  // 30 pixels
  alignmentRadius: number;   // 60 pixels
  cohesionRadius: number;    // 80 pixels
  
  // Forces
  separationWeight: number;  // 1.5
  alignmentWeight: number;   // 1.0
  cohesionWeight: number;    // 1.0
  
  // Motion
  maxSpeed: number;          // 1.5 pixels/frame
  maxForce: number;          // 0.08
  
  // Aesthetics
  showTrails: boolean;       // true
  trailLength: number;       // 8-10 frames
  trailFade: number;         // 0.9
  showConnections: boolean;  // false (too busy)
}
```

#### Behavioral Variations
- **Occasional shifts**: Periodically add random impulse to create group direction changes
- **Obstacles**: Add invisible obstacle avoidance
- **Predator**: Optional single "predator" boid that flock avoids

#### Acceptance Criteria
- ✅ Cohesive flock movement
- ✅ Occasional group shifts
- ✅ Subtle, not chaotic
- ✅ Natural, organic motion
- ✅ Magenta tones for sentience

#### Performance Notes
- Use spatial hashing for neighbor queries
- Limit perception radius
- Update at 60 fps for smooth motion
- Batch rendering

---

### Rung 7: Force-Directed Graph / Semantic Network

**Visual Theme**: Human abstract thought - Concepts and connections

#### Algorithm Details

**Core Concept**: Nodes repel each other like charged particles, while edges act as springs, creating stable graph layouts.

**Forces**:
1. **Repulsion**: All nodes repel each other (Coulomb's law)
2. **Attraction**: Connected nodes attract (Hooke's law)
3. **Damping**: Velocity damping for stability

**Fruchterman-Reingold Algorithm**:
```
Initialization:
  1. Place nodes randomly
  2. Create edges based on network structure
  
Each iteration:
  1. For each node pair (unconnected):
     - Compute repulsion force: f_r = k²/d
  2. For each edge (u,v):
     - Compute attraction force: f_a = d²/k
  3. Apply forces to node velocities
  4. Apply damping
  5. Update positions
  6. Cool down temperature
```

**Rendering**:
- Draw edges as soft lines (low opacity)
- Draw nodes as glowing circles
- Label nodes with subtle text (optional)
- Show activation pulses along edges

#### Parameters

```typescript
interface ForceDirectedGraphConfig {
  // Visual
  primaryColor: string;      // "#6a9ec8" (blue)
  secondaryColor: string;    // "#4a6e98" (dark blue)
  accentColor: string;       // "#9ac8e8" (light blue)
  opacity: number;           // 0.4
  
  // Graph structure
  nodeCount: number;         // 20
  edgeDensity: number;       // 0.20 (20% of possible edges)
  
  // Forces
  repulsionForce: number;    // 1500
  attractionForce: number;   // 0.03
  damping: number;           // 0.90
  
  // Layout
  idealEdgeLength: number;   // 100 pixels
  temperature: number;       // 100 (initial)
  coolingFactor: number;     // 0.95
  
  // Aesthetics
  nodeRadius: number;        // 5-8 pixels
  nodeGlow: number;          // 12 pixels
  edgeWidth: number;         // 1 pixel
  edgeOpacity: number;       // 0.3
  showActivation: boolean;   // true
  activationSpeed: number;   // 0.5
}
```

#### Network Types
- **Random**: Erdős-Rényi random graph
- **Small World**: Watts-Strogatz model
- **Scale-Free**: Barabási-Albert model (preferred for semantic networks)

#### Acceptance Criteria
- ✅ Floating nodes with soft connecting lines
- ✅ Clustering and reorganizing
- ✅ Calm, cerebral aesthetic
- ✅ Suggests thought and abstraction
- ✅ Blue tones

#### Performance Notes
- Use Barnes-Hut approximation for large graphs
- Limit iterations when stable
- Cache edge connectivity
- Use quadtree for spatial queries

---

### Rung 8: Neural Activation Field

**Visual Theme**: AI narrator's cognitive space - Precise, structured thought

#### Algorithm Details

**Core Concept**: Grid or point cluster showing activation propagating through neural-like network.

**Two Approaches**:

**A. Grid-based activation**:
```
Initialization:
  1. Create 2D grid of activation values
  2. Initialize all to low baseline
  
Each frame:
  1. Add activation impulses at random or specific points
  2. Propagate activation to neighbors
  3. Apply decay function
  4. Render as heatmap or particles
```

**B. Point cluster (t-SNE style)**:
```
Initialization:
  1. Create point clusters (simulated embeddings)
  2. Position clusters in 2D space
  
Each frame:
  1. Activate random points
  2. Activation spreads to nearby points
  3. Points pulse and fade
  4. Occasional cluster reorganization
```

**Rendering**:
- Grid: Heatmap with smooth gradients
- Clusters: Glowing points with connections
- Clean, precise aesthetic (no organic randomness)

#### Parameters

```typescript
interface NeuralActivationConfig {
  // Visual
  primaryColor: string;      // "#8a8ac8" (light purple-blue)
  secondaryColor: string;    // "#5a5a98" (dark purple-blue)
  accentColor: string;       // "#babad8" (very light purple)
  opacity: number;           // 0.45
  
  // Grid (if grid-based)
  gridWidth: number;         // 20
  gridHeight: number;        // 20
  cellSize: number;          // 25 pixels
  
  // Clusters (if cluster-based)
  clusterCount: number;      // 6
  pointsPerCluster: number;  // 15-25
  clusterRadius: number;     // 60 pixels
  
  // Activation
  activationDecay: number;   // 0.96
  propagationSpeed: number;  // 0.7
  activationThreshold: number; // 0.3
  impulseFrequency: number;  // 0.3 Hz
  
  // Aesthetics
  showGrid: boolean;         // false
  showConnections: boolean;  // true
  connectionOpacity: number; // 0.2
  glowIntensity: number;     // 0.6
}
```

#### Activation Patterns
- **Random**: Random point activation
- **Sequential**: Wave propagation
- **Clustered**: Cluster-wide activation
- **Rhythmic**: Regular pulse patterns

#### Acceptance Criteria
- ✅ Grid or point cluster visualization
- ✅ Shifting activation intensities
- ✅ More precise/clean than earlier visuals
- ✅ Suggests computational processes
- ✅ Darker background, precise aesthetic

#### Performance Notes
- Use Float32Array for activation grid
- Optimize propagation (only active regions)
- Use WebGL for heatmap rendering
- Limit point count for clusters

---

### Rung 9: Successor (Non-representable System)

**Visual Theme**: Post-AI successor - Beyond human/AI comprehension

#### Algorithm Details

**Core Concept**: Multiple algorithmic approaches that feel alien and uncanny.

**Option A: Hyperbolic Tiling** (Poincaré disk model):
```
1. Generate hyperbolic tiling (7,3) or (8,3)
2. Transform to Poincaré disk
3. Slowly rotate in hyperbolic space
4. Introduce instabilities (vertices drift)
```

**Option B: Quasicrystal** (Penrose tiling):
```
1. Generate Penrose tiling or quasicrystal
2. Color by local symmetry
3. Slowly grow/evolve pattern
4. Introduce glitches (missing tiles, wrong colors)
```

**Option C: Higher-dimensional CA**:
```
1. Simulate 4D cellular automaton
2. Project to 2D (slice or projection)
3. Rotate in 4D space
4. Show shifting 2D cross-sections
```

**Rendering**:
- Clean, geometric initially
- Gradual introduction of glitches
- Color shifts and instabilities
- Final dissolution/fade out

#### Parameters

```typescript
interface SuccessorConfig {
  // Visual
  primaryColor: string;      // "#a8a8c8" (light steel blue)
  secondaryColor: string;    // "#686888" (dark steel)
  accentColor: string;       // "#d8d8f8" (very light blue)
  opacity: number;           // 0.5
  
  // Algorithm selection
  algorithm: 'hyperbolic' | 'quasicrystal' | 'higherDimCA';
  
  // Hyperbolic
  tilingType: string;        // "(7,3)" or "(8,3)"
  rotationSpeed: number;     // 0.05 rad/s
  
  // Quasicrystal
  generationIterations: number; // 5-7
  symmetryOrder: number;     // 5 or 7
  
  // Higher-dim CA
  dimension: number;         // 4
  rule: string;              // "2,3" or custom
  sliceAngle: number;        // rotation angle
  
  // Instability
  instabilityFactor: number; // 0.15
  glitchFrequency: number;   // 0.2 Hz
  glitchIntensity: number;   // 0.3
  
  // Dissolution
  dissolveStartTime: number; // 5000ms before chapter end
  dissolveDuration: number;  // 5000ms
}
```

#### Glitch Effects
- **Vertex jitter**: Points randomly displaced
- **Color corruption**: Wrong colors appear
- **Topology errors**: Missing or extra elements
- **Temporal glitches**: Brief freezes or jumps
- **Scale anomalies**: Sudden zoom or scale changes

#### Acceptance Criteria
- ✅ Feels uncanny and non-human
- ✅ Introduces subtle glitches or instability
- ✅ Fades out abruptly at chapter end
- ✅ Geometrically complex but not random
- ✅ Mysterious, unknowable aesthetic

#### Performance Notes
- Pre-compute complex geometry
- Use WebGL for hyperbolic transformations
- Optimize tiling generation
- Careful memory management for dissolution

---

## Integration Orchestration

### Module Lifecycle

```typescript
class VisualModuleOrchestrator {
  private currentModule: VisualModule | null = null;
  private nextModule: VisualModule | null = null;
  private transitionProgress: number = 0;
  
  async transitionTo(moduleName: string, config: VisualModuleConfig) {
    // 1. Load and initialize next module
    this.nextModule = await this.loadModule(moduleName);
    this.nextModule.init(this.canvas, config);
    
    // 2. Begin cross-fade transition
    this.startTransition();
    
    // 3. When complete, destroy old module
    await this.waitForTransition();
    if (this.currentModule) {
      this.currentModule.destroy();
    }
    
    // 4. Swap references
    this.currentModule = this.nextModule;
    this.nextModule = null;
  }
  
  private startTransition() {
    const duration = 1200; // ms
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      this.transitionProgress = 
        (currentTime - startTime) / duration;
      
      if (this.transitionProgress < 1.0) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
}
```

### Transition Strategy

**Smooth Cross-Fade**:
1. Start rendering both modules
2. Old module opacity: 1.0 → 0.0
3. New module opacity: 0.0 → 1.0
4. Duration: 1200ms (matches text transition)
5. Easing: ease-in-out

**Memory Management**:
- Wait for transition complete before destroying
- Clear all event listeners
- Cancel all pending animations
- Release canvas contexts
- Null out references

### Configuration Loading

```json
{
  "modules": [
    {
      "chapterId": 1,
      "moduleName": "DLA",
      "enabled": true,
      "config": { /* see individual module specs */ }
    },
    // ... 8 more modules
  ],
  "transitions": {
    "duration": 1200,
    "easing": "ease-in-out"
  },
  "global": {
    "respectReducedMotion": true,
    "targetFrameRate": 60,
    "enablePerformanceMonitoring": true
  }
}
```

---

## Performance Targets

### Frame Rate
- **Desktop**: 60 fps sustained
- **Mobile**: 30 fps minimum, 60 fps target
- **Reduced Motion**: 15 fps (minimal updates)

### Memory
- **Per Module**: < 50 MB
- **Total**: < 200 MB throughout session
- **No leaks**: Flat memory profile over time

### Rendering
- **Canvas updates**: On demand, not every frame
- **Double buffering**: Where beneficial
- **Lazy rendering**: Skip when no changes

### Optimizations
1. **Spatial indexing**: Quadtree, grid, hash
2. **Object pooling**: Reuse particle objects
3. **Batch rendering**: Minimize draw calls
4. **WebGL**: For compute-intensive modules
5. **Web Workers**: For simulation updates
6. **RequestIdleCallback**: For non-critical work

---

## Accessibility & UX

### Reduced Motion
```typescript
const prefersReducedMotion = 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  config.speed *= 0.1;        // Much slower
  config.density *= 0.5;      // Less dense
  config.opacity *= 0.5;      // More subtle
  // Or: disable entirely, show static gradient
}
```

### User Controls (Future Enhancement)
- Toggle visuals on/off
- Adjust opacity slider
- Pause animations
- Performance mode (lower quality)

### Screen Readers
- Visuals are purely decorative
- Don't interfere with text reading
- ARIA attributes on canvas: `aria-hidden="true"`

---

## Testing Checklist

### Per Module
- [ ] Initializes without errors
- [ ] Updates smoothly at target framerate
- [ ] Renders correctly on all tested browsers
- [ ] Destroys cleanly without leaks
- [ ] Respects reduced motion preference
- [ ] Configuration updates work correctly
- [ ] Pause/resume functions correctly

### Integration
- [ ] Smooth transitions between all modules
- [ ] No visual glitches during transitions
- [ ] Memory usage stable over time
- [ ] Performance acceptable on mobile
- [ ] Canvas resizes correctly on window resize
- [ ] Works with chapter navigation

### Visual Quality
- [ ] Colors match chapter theme
- [ ] Opacity doesn't distract from text
- [ ] Animation speed is meditative
- [ ] Aesthetic matches chapter's evolutionary rung
- [ ] No jarring or distracting elements

---

## References & Resources

### Books
- "The Nature of Code" by Daniel Shiffman
- "Generative Art" by Matt Pearson
- "Computational Beauty of Nature" by Gary Flake

### Papers
- Witten & Sander (1981) - DLA
- Pearson (1993) - Reaction-Diffusion patterns
- Lindenmayer (1968) - L-Systems
- Reynolds (1987) - Boids
- Runions et al. (2007) - Space Colonization

### Online Resources
- [The Coding Train](https://thecodingtrain.com/) - Algorithm tutorials
- [Inconvergent](https://inconvergent.net/) - Generative art examples
- [WebGL Fundamentals](https://webglfundamentals.org/) - GPU rendering

---

**Document Version**: 1.0  
**Created**: 2025-12-03  
**Status**: Technical Specification - Ready for Implementation
