# Audio Modules Implementation Plan

## Overview

This document outlines the implementation strategy for adding generative audio modules to the Unsung Heroes interactive reader. Each evolutionary rung (chapter) will have a corresponding audio module that creates an atmospheric, ambient soundscape reflecting the chapter's themes without distracting from the text or competing with the visual modules.

## Project Context

- **Repository**: lbsa71/unsung-heroes
- **Application**: React/TypeScript interactive reader using Vite
- **Current State**: Text-based reader with generative visual modules
- **Goal**: Add generative audio backgrounds that enhance each chapter's atmosphere while remaining subtle and non-distracting

## Design Principles

### Sound Philosophy

The audio modules follow these core principles to ensure they enhance rather than distract:

1. **Ambient-First**: All sounds are background textures, never foreground music
2. **Non-Rhythmic**: No beats, no patterns the brain can lock onto
3. **Sparse**: Long intervals between discrete events
4. **Quiet**: Default gain at -26 dB to -18 dB
5. **Subtle**: No sharp attacks, no percussive envelopes
6. **Complementary**: Audio follows visual transitions smoothly

### User Experience Guidelines

- **Volume**: Very low by default (-26 dB to -18 dB)
- **Spatialization**: Gentle stereo widening over 20-60 second cycles
- **Density**: Sparse events only, never rhythmic
- **Timbre**: No bright highs above ~6 kHz, use soft shapes
- **Interaction**: Sound transitions with visuals (3-7 second crossfades)
- **Control**: User can easily disable or adjust volume

## Architecture Overview

### Audio Module Interface

Each audio module will be a self-contained TypeScript class implementing a common interface, mirroring the visual module pattern:

```typescript
interface AudioModuleConfig {
  // Volume and mixing
  masterGain: number;         // 0.0 - 1.0 (maps to dB range)
  panWidth: number;           // 0.0 - 1.0 (stereo width)
  
  // Timbre
  lowCutoff: number;          // Hz (high-pass filter)
  highCutoff: number;         // Hz (low-pass filter)
  
  // Behavior parameters
  density: number;            // 0.0 - 1.0 (sparse to dense)
  complexity: number;         // 0.0 - 1.0 (simple to complex)
  
  // Module-specific parameters (extended by individual modules)
  [key: string]: any;
}

interface AudioModule {
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
}
```

### Directory Structure

```
reader/
├── AUDIO_MODULES_IMPLEMENTATION_PLAN.md  # This document
├── AUDIO_MODULES_TECHNICAL_SPEC.md       # Detailed algorithm specs
└── src/
    └── audioModules/
        ├── index.ts                      # Export all modules
        ├── BaseAudioModule.ts            # Abstract base class
        ├── AudioModuleTypes.ts           # TypeScript interfaces
        ├── AudioModuleOrchestrator.ts    # Lifecycle management
        ├── modules/
        │   ├── FilteredNoiseModule.ts    # Rung 1: Pink/brown noise
        │   ├── GranularCloudModule.ts    # Rung 2: Granular textures
        │   ├── SparseFMModule.ts         # Rung 3: FM bleeps
        │   ├── MicrosoundModule.ts       # Rung 4: Glitch textures
        │   ├── AdditiveDroneModule.ts    # Rung 5: Harmonic drones
        │   ├── StereoShiftModule.ts      # Rung 6: Shifting pads
        │   ├── SyntheticChimesModule.ts  # Rung 7: Gentle chimes
        │   ├── NeuralSonificationModule.ts # Rung 8: Neural activation
        │   └── HyperlowRumbleModule.ts   # Rung 9: Sub-bass + glitch
        ├── config/
        │   └── audioConfig.json          # Configuration for each rung
        ├── components/
        │   └── AudioControl.tsx          # React component for controls
        └── hooks/
            └── useAudioModule.ts         # React hook for module lifecycle
```

## Sound Algorithm to Rung Mapping

Based on the issue requirements, here's the mapping of sound algorithms to evolutionary rungs:

| Rung | Theme | Visual Mode | Audio Algorithm | Conceptual Reason |
|------|-------|-------------|-----------------|-------------------|
| 1 | Pre-cellular replicators | DLA | Filtered pink noise + ultra-rare soft grains | Diffuse, pre-intent patterns |
| 2 | Protocells | Reaction-Diffusion | Slow granular texture cloud | Chemical morphogenesis |
| 3 | RNA-world organisms | L-systems | Sparse FM beeps | Branching, discrete replication |
| 4 | Early cells | Cellular Automata | Light microsound crackles | Discrete state transitions |
| 5 | Multicellular life | Morphogenesis | Additive harmonic drone | Multicellular coordination |
| 6 | Sentient animals | Boids | Soft shifting stereo pads | Group behavior, cohesion |
| 7 | Humans | Force-Directed Graph | Gentle synthetic chimes, very slow | Thought clusters forming |
| 8 | Machine minds | Neural Activation | Neural sonification (LFO-shifting sine clusters) | Internal structure adjusting |
| 9 | Successor | Hyperbolic/quasicrystal | Glitchy microsound + hyperlow rumble | Beyond organic or silicon |

## Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal**: Establish the architecture and create base classes

- [ ] Create project structure and directories
- [ ] Define TypeScript interfaces (`AudioModuleTypes.ts`)
- [ ] Implement `BaseAudioModule` abstract class
- [ ] Create `AudioModuleOrchestrator` for lifecycle management
- [ ] Implement `AudioControl` React component
- [ ] Create `useAudioModule` React hook
- [ ] Set up configuration JSON structure
- [ ] Write unit tests for base classes

**Deliverables**:
- Complete type system for audio modules
- Base class with common functionality (AudioContext management, gain control, filtering)
- Orchestrator for smooth transitions between modules
- React integration components
- Configuration template

**Key Technical Decisions**:
- Use Web Audio API exclusively (no external libraries)
- Share single AudioContext across all modules
- Implement proper cleanup to prevent memory leaks
- Use AudioWorkletNode for custom processors where needed

### Phase 2: Simple Modules (Week 2)

**Goal**: Implement the simpler audio algorithms

- [ ] Implement FilteredNoiseModule (Rung 1)
- [ ] Implement AdditiveDroneModule (Rung 5)
- [ ] Implement StereoShiftModule (Rung 6)
- [ ] Write unit tests for each module
- [ ] Create configuration presets in audioConfig.json
- [ ] Verify performance and memory usage

**Success Criteria**:
- Each module produces appropriate ambient sound
- No audible clicks or pops on start/stop
- Smooth parameter transitions
- Memory stable over time
- CPU usage < 5% per module

### Phase 3: Complex Modules (Week 3)

**Goal**: Implement the more complex audio algorithms

- [ ] Implement GranularCloudModule (Rung 2)
- [ ] Implement SparseFMModule (Rung 3)
- [ ] Implement SyntheticChimesModule (Rung 7)
- [ ] Implement NeuralSonificationModule (Rung 8)
- [ ] Write unit tests for each module
- [ ] Configuration tuning and optimization

**Technical Challenges**:
- Granular synthesis requires buffer management
- FM synthesis needs careful parameter control
- Neural sonification needs multi-oscillator coordination
- All must maintain minimal CPU usage

### Phase 4: Advanced Modules (Week 4)

**Goal**: Implement the most experimental modules

- [ ] Implement MicrosoundModule (Rung 4)
- [ ] Implement HyperlowRumbleModule (Rung 9)
- [ ] Write unit tests for each module
- [ ] Fine-tune all modules for aesthetic consistency
- [ ] Cross-device testing (desktop, mobile, tablets)

**Special Considerations**:
- Microsound requires precise timing control
- Hyperlow frequencies need special handling on mobile
- Glitch effects must be controlled, not chaotic
- Test on headphones and speakers

### Phase 5: Integration (Week 5)

**Goal**: Integrate audio with existing reader and visual modules

- [ ] Update Reader.tsx to include audio integration
- [ ] Sync audio transitions with visual transitions
- [ ] Implement user controls (volume, mute, enable/disable)
- [ ] Add loading states and error handling
- [ ] Ensure proper cleanup on page unload
- [ ] Performance monitoring and optimization
- [ ] Accessibility improvements

**Integration Points**:
- AudioContext initialization on user interaction (browser requirement)
- Coordinated fade in/out with chapter transitions
- Shared timing with visual module updates
- Proper cleanup when switching chapters

### Phase 6: Polish & Testing (Week 6)

**Goal**: Final refinements and comprehensive testing

- [ ] Performance profiling across all modules
- [ ] Memory leak detection and prevention
- [ ] Cross-browser compatibility testing
- [ ] Mobile device testing (various speakers/headphones)
- [ ] User testing for distraction level
- [ ] Configuration fine-tuning based on feedback
- [ ] Final documentation and examples
- [ ] Create user guide for audio controls

**Quality Assurance**:
- Test on Chrome, Firefox, Safari, Edge
- Test on iOS, Android, desktop
- Test with headphones, speakers, various volumes
- Ensure no audio artifacts or glitches
- Verify smooth transitions
- Confirm minimal CPU/memory usage

**Total Estimated Time**: 6 weeks

## Technical Requirements

### Web Audio API Components

All modules will use these Web Audio API building blocks:

- **AudioContext**: Shared context for all modules
- **OscillatorNode**: For tones, drones, and LFOs
- **GainNode**: For volume control and envelopes
- **BiquadFilterNode**: For frequency shaping
- **PannerNode** or **StereoPannerNode**: For spatialization
- **AudioBufferSourceNode**: For granular synthesis
- **AudioWorkletNode**: For custom processing (noise, bitcrushing)
- **DynamicsCompressorNode**: For gentle limiting (safety)

### Performance Targets

- **CPU Usage**: < 5% per module on desktop, < 10% on mobile
- **Memory**: < 10 MB per module
- **Latency**: < 50ms from parameter change to audio effect
- **Startup Time**: < 200ms to initialize
- **No Memory Leaks**: Flat memory profile over 30+ minutes
- **No Audio Glitches**: Zero clicks, pops, or artifacts

### Browser Support

- **Modern browsers** with Web Audio API support
- **Graceful degradation** with visual-only mode
- **Feature detection** for AudioWorklet
- **Mobile optimization** with reduced complexity

### Accessibility

- **User Control**: Easy mute/volume controls
- **Respect prefers-reduced-motion**: Reduce density/complexity
- **No sudden loud sounds**: Gentle fades only
- **Visual indicators**: Show audio status clearly
- **Keyboard accessible**: All controls keyboard-navigable

## Configuration System

All modules are configured through `audioConfig.json`, mirroring the visual config structure:

```json
{
  "modules": [
    {
      "chapterId": 1,
      "moduleName": "FilteredNoise",
      "enabled": true,
      "config": {
        "masterGain": 0.15,
        "panWidth": 0.3,
        "lowCutoff": 100,
        "highCutoff": 600,
        "density": 0.2,
        "complexity": 0.3,
        "noiseType": "pink",
        "filterModulationRate": 0.02,
        "filterModulationDepth": 40,
        "grainDensity": 0.001,
        "grainDuration": 0.2
      }
    }
    // ... 8 more modules
  ],
  "transitions": {
    "duration": 3000,
    "easing": "ease-in-out"
  },
  "global": {
    "respectReducedMotion": true,
    "enableAudio": true,
    "defaultVolume": 0.5,
    "maxConcurrentModules": 2,
    "masterCompression": true
  }
}
```

## Integration with Reader

### AudioContext Initialization

Due to browser autoplay policies, AudioContext must be initialized on user interaction:

```typescript
// In Reader.tsx or App.tsx
const initAudioOnFirstInteraction = () => {
  const audioContext = new AudioContext();
  // Store in context or state
};

// Attach to first user click/tap
```

### Coordination with Visual Modules

Audio and visual modules transition together:

```typescript
const handleChapterTransition = async (newChapterIndex: number) => {
  // Start crossfade
  await Promise.all([
    visualOrchestrator.transitionTo(newChapterIndex),
    audioOrchestrator.transitionTo(newChapterIndex)
  ]);
};
```

### User Controls

Simple, non-intrusive audio controls:

- **Mute button**: Quick toggle
- **Volume slider**: Adjust overall volume
- **Enable/disable**: Completely turn off audio
- **Per-chapter override**: Advanced users can customize

## Testing Strategy

### Unit Tests

- Lifecycle methods for each module
- Configuration updates
- Gain ramping (fade in/out)
- Cleanup verification (no memory leaks)

### Integration Tests

- Module switching via orchestrator
- Smooth transitions between chapters
- AudioContext sharing
- Performance under load

### Audio Quality Tests

- Manual listening tests
- Frequency analysis (ensure no unexpected peaks)
- Distortion testing
- Cross-device consistency

### User Testing

- Distraction level assessment
- Volume appropriateness
- Aesthetic fit with chapters
- Control usability

## Success Criteria

### Functional

- ✅ All 9 modules implemented and working
- ✅ Smooth transitions between chapters/modules
- ✅ No memory leaks or performance degradation
- ✅ Configuration system working correctly
- ✅ Proper lifecycle management
- ✅ User controls functional and intuitive

### Audio Quality

- ✅ Each module reflects its chapter's theme
- ✅ Audio enhances atmosphere without distraction
- ✅ Sonic palette consistent with story themes
- ✅ Smooth, meditative aesthetic maintained
- ✅ No clicks, pops, or artifacts
- ✅ Appropriate volume levels

### Performance

- ✅ CPU usage < 5% per module on desktop
- ✅ CPU usage < 10% per module on mobile
- ✅ No memory growth over time
- ✅ Audio doesn't block UI rendering
- ✅ Smooth transitions without dropouts

### Accessibility

- ✅ Respects prefers-reduced-motion
- ✅ Easy to mute/disable
- ✅ Doesn't interfere with text readability
- ✅ Works on all supported devices
- ✅ Keyboard accessible controls

## Risk Mitigation

### Performance Risks

- **Mitigation**: Use AudioWorklets for heavy processing
- **Mitigation**: Limit oscillator count per module
- **Mitigation**: Performance monitoring and auto-adjustment
- **Mitigation**: Mobile-specific optimizations

### Browser Compatibility

- **Mitigation**: Feature detection for AudioWorklet
- **Mitigation**: Fallback to ScriptProcessorNode if needed
- **Mitigation**: Graceful degradation to visual-only mode
- **Mitigation**: Cross-browser testing in CI

### Audio Distraction

- **Mitigation**: Very low default volume
- **Mitigation**: Sparse, non-rhythmic sounds
- **Mitigation**: User testing and iteration
- **Mitigation**: Easy mute controls

### Memory Leaks

- **Mitigation**: Strict destroy() implementation
- **Mitigation**: React hooks for automatic cleanup
- **Mitigation**: Memory profiling during development
- **Mitigation**: Automated leak detection tests

## Implementation Examples

### Filtered Noise Module (Rung 1)

```typescript
// FilteredNoiseModule.ts
export class FilteredNoiseModule extends BaseAudioModule {
  private noiseBuffer?: AudioBuffer;
  private noiseSource?: AudioBufferSourceNode;
  private filter?: BiquadFilterNode;
  private lfo?: OscillatorNode;
  private lfoGain?: GainNode;
  
  protected onInit(): void {
    // Create pink noise buffer
    this.noiseBuffer = this.createPinkNoise();
    
    // Create filter
    this.filter = this.audioContext!.createBiquadFilter();
    this.filter.type = 'bandpass';
    this.filter.frequency.value = this.config.highCutoff / 2;
    this.filter.Q.value = 0.5;
    
    // Create LFO for slow modulation
    this.lfo = this.audioContext!.createOscillator();
    this.lfo.frequency.value = this.config.filterModulationRate;
    this.lfoGain = this.audioContext!.createGain();
    this.lfoGain.gain.value = this.config.filterModulationDepth;
    
    // Connect: LFO -> filter frequency
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.filter.frequency);
  }
  
  protected onStart(): void {
    // Start noise source
    this.noiseSource = this.audioContext!.createBufferSource();
    this.noiseSource.buffer = this.noiseBuffer!;
    this.noiseSource.loop = true;
    
    // Connect: noise -> filter -> output
    this.noiseSource.connect(this.filter!);
    this.filter!.connect(this.outputGain!);
    
    // Start
    this.noiseSource.start();
    this.lfo!.start();
  }
  
  private createPinkNoise(): AudioBuffer {
    // Pink noise generation algorithm
    // ... implementation
  }
}
```

### Sparse FM Module (Rung 3)

```typescript
// SparseFMModule.ts
export class SparseFMModule extends BaseAudioModule {
  private eventInterval?: number;
  
  protected onInit(): void {
    // Setup random event triggering
  }
  
  protected onStart(): void {
    this.scheduleNextEvent();
  }
  
  private scheduleNextEvent(): void {
    const interval = this.calculateInterval();
    this.eventInterval = window.setTimeout(() => {
      this.triggerFMEvent();
      this.scheduleNextEvent();
    }, interval);
  }
  
  private triggerFMEvent(): void {
    if (Math.random() > this.config.density) return;
    
    // Create carrier and modulator
    const carrier = this.audioContext!.createOscillator();
    const modulator = this.audioContext!.createOscillator();
    const modGain = this.audioContext!.createGain();
    const envelope = this.audioContext!.createGain();
    
    // Configure FM synthesis
    const baseFreq = 200 + Math.random() * 100;
    carrier.frequency.value = baseFreq;
    modulator.frequency.value = baseFreq * 2;
    modGain.gain.value = 50;
    
    // Connect: modulator -> gain -> carrier.frequency
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(envelope);
    envelope.connect(this.outputGain!);
    
    // Envelope
    const now = this.audioContext!.currentTime;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.1, now + 0.1);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    // Start and cleanup
    carrier.start(now);
    modulator.start(now);
    carrier.stop(now + 0.6);
    modulator.stop(now + 0.6);
    
    // Cleanup after event
    setTimeout(() => {
      carrier.disconnect();
      modulator.disconnect();
      modGain.disconnect();
      envelope.disconnect();
    }, 700);
  }
}
```

## Next Steps

1. **Review and Approve**: Stakeholder review of this plan
2. **Phase 1 Start**: Begin implementation of base classes and types
3. **Prototype**: Create first module (FilteredNoise) to validate architecture
4. **Iterate**: Gather feedback and refine approach
5. **Scale**: Implement remaining modules following proven pattern
6. **Integrate**: Connect with existing visual modules and reader
7. **Polish**: User testing and refinement

## References

### Web Audio API

- MDN Web Audio API documentation
- Web Audio API specification (W3C)
- AudioWorklet examples and patterns

### Sound Design Principles

- Ambient music theory (Brian Eno)
- Generative music systems
- Non-intrusive interface sounds
- Spatial audio for web

### Algorithm Sources

- Pink noise generation algorithms
- Granular synthesis techniques
- FM synthesis mathematics
- Microsound composition methods

## Conclusion

This implementation plan provides a comprehensive roadmap for adding generative audio modules to the Unsung Heroes interactive reader. The plan:

✅ **Mirrors Visual Architecture**: Uses same patterns as visual modules  
✅ **9 Audio Algorithms**: Detailed specifications for each rung  
✅ **Non-Distracting Design**: Carefully tuned to enhance, not distract  
✅ **Performance Optimized**: Clear targets for CPU and memory  
✅ **Accessible**: User controls and prefers-reduced-motion support  
✅ **Timeline**: 6-week implementation schedule

The audio modules will complement the visual modules to create a complete multi-sensory experience that enhances the philosophical depth and emotional impact of the story.

---

**Document Version**: 1.0  
**Created**: 2025-12-03  
**Status**: Planning Complete - Ready for Implementation  
**Estimated Completion**: 6 weeks from start
