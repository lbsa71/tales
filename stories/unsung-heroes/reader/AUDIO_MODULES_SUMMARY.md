# Audio Modules Summary

## Executive Summary

This document summarizes the complete planning for adding generative audio modules to the Unsung Heroes interactive reader. The plan addresses the requirements specified in issue: "Create plan for audioModules to complement visualModules."

## Overview

The implementation adds atmospheric, ambient soundscapes to each chapter of the story. Each of the 9 evolutionary rungs (chapters) will have a unique generative audio module that complements its visual module, creating a complete multi-sensory experience without distracting from the text.

## Key Deliverables

### 1. Documentation (COMPLETE ✅)

Four comprehensive documents have been created:

1. **AUDIO_MODULES_IMPLEMENTATION_PLAN.md** (20KB)
   - Overall architecture and project structure
   - 6-week implementation timeline with 6 phases
   - Module interface definitions
   - Integration strategies with visual modules
   - Risk mitigation and success criteria

2. **AUDIO_MODULES_TECHNICAL_SPEC.md** (24KB)
   - Detailed algorithm specifications for each rung
   - Exact parameters and configuration options
   - Web Audio API implementation details
   - Code examples and references
   - Testing procedures

3. **src/audioModules/README.md** (10KB)
   - Quick start guide for developers
   - Module reference with sound descriptions
   - Common interface documentation
   - Development guidelines and best practices
   - Browser compatibility notes

4. **src/audioModules/config/audioConfig.json** (5.8KB)
   - Complete configuration template
   - Pre-tuned parameters for all 9 modules
   - Global settings and transition configuration
   - JSON structure mirroring visualConfig.json

### 2. Directory Structure (COMPLETE ✅)

Created the foundation for the audio modules system:

```
reader/
├── AUDIO_MODULES_IMPLEMENTATION_PLAN.md
├── AUDIO_MODULES_TECHNICAL_SPEC.md
└── src/
    └── audioModules/
        ├── README.md
        ├── index.ts
        ├── AudioModuleTypes.ts
        ├── config/
        │   └── audioConfig.json
        ├── modules/
        │   └── (ready for implementation)
        ├── components/
        │   └── (ready for implementation)
        └── hooks/
            └── (ready for implementation)
```

## Architecture

### Module Interface

Each audio module implements a common interface, mirroring the visual module pattern:

```typescript
interface AudioModule {
  // Lifecycle methods
  init(audioContext: AudioContext, config: AudioModuleConfig): void;
  start(): void;
  stop(): void;
  destroy(): void;
  
  // Configuration
  updateConfig(config: Partial<AudioModuleConfig>): void;
  getConfig(): AudioModuleConfig;
  
  // State management
  pause(): void;
  resume(): void;
  fadeIn(duration: number): void;
  fadeOut(duration: number): void;
}
```

### Component Architecture

1. **BaseAudioModule** - Abstract base class with common functionality
2. **AudioModuleOrchestrator** - Manages module lifecycle and transitions
3. **Individual Modules** - 9 algorithm-specific implementations
4. **React Integration** - Components and hooks for Reader integration

## Audio to Visual Module Mapping

Complete alignment between audio and visual modules for each evolutionary rung:

| Rung | Theme | Visual Module | Audio Module | Sound Algorithm |
|------|-------|---------------|--------------|-----------------|
| 1 | Pre-cellular replicators | DLA | FilteredNoise | Pink noise + ultra-rare grains |
| 2 | Protocells | Reaction-Diffusion | GranularCloud | Slow granular textures |
| 3 | RNA-world organisms | L-systems | SparseFM | Sparse FM bleeps |
| 4 | Early cells | Cellular Automata | Microsound | Light crackles/glitches |
| 5 | Multicellular life | Morphogenetic Growth | AdditiveDrone | Harmonic drone |
| 6 | Sentient animals | Boids | StereoShift | Shifting stereo pads |
| 7 | Humans | Force-Directed Graph | SyntheticChimes | Gentle chimes |
| 8 | Machine minds | Neural Activation | NeuralSonification | LFO-shifted oscillators |
| 9 | Successor | Hyperbolic/Quasicrystal | HyperlowRumble | Sub-bass + glitch |

## Design Principles

### Non-Distracting Sound Design

All modules follow strict principles to ensure they enhance rather than distract:

#### Volume
- Default gain: -26 dB to -18 dB (very low)
- No percussive envelopes (avoid sharp attacks)
- Master limiter for safety

#### Spatialization
- Gentle stereo widening over 20-60 second cycles
- No left-right "twitching"
- Smooth pan automation

#### Density
- Sparse events only
- Never rhythmic
- Avoid repetition the brain can lock onto

#### Timbre
- No bright highs above ~6 kHz
- Use soft shapes: sine, triangle, filtered noise
- Avoid harsh square waves unless heavily filtered

#### Interaction
- Sound transitions with visuals (3-7 second crossfades)
- No sound on hover or click
- Ambient bed only

## Audio Module Specifications

### Rung 1: Filtered Noise (Pink/Brown Noise Sculpting)

- **Algorithm**: Continuous pink noise with slow bandpass modulation + ultra-rare soft grains
- **Character**: Cosmic hum, pre-semantic sound bed
- **Performance**: AudioWorklet for noise generation, low CPU
- **Key Parameters**: `noiseType`, `filterModulationRate`, `grainDensity`

### Rung 2: Granular Cloud

- **Algorithm**: Sparse granular synthesis with Gaussian envelopes
- **Character**: Soft murmuring texture, cellular processes
- **Performance**: Grain pool for efficiency, 5-12 concurrent grains
- **Key Parameters**: `minConcurrentGrains`, `spawnRate`, `stereoSpread`

### Rung 3: Sparse FM

- **Algorithm**: 2-operator FM synthesis, very sparse events
- **Character**: Barely audible glints of emerging order
- **Performance**: Event-based creation/destruction, ~3 events/minute
- **Key Parameters**: `eventDensity`, `modulatorRatio`, `modulationIndex`

### Rung 4: Microsound

- **Algorithm**: Bitcrushing and sample-rate reduction
- **Character**: Tiny digital errors, quiet static
- **Performance**: AudioWorklet for distortion, sparse triggers
- **Key Parameters**: `crackleRate`, `bitDepth`, `sampleRateReduction`

### Rung 5: Additive Drone

- **Algorithm**: 3-5 sine waves with slow phase modulation
- **Character**: Meditative, non-melodic ambience
- **Performance**: Low CPU (just oscillators and LFOs)
- **Key Parameters**: `oscillatorCount`, `harmonicRatios`, `phaseDriftRate`

### Rung 6: Stereo Shift

- **Algorithm**: Multiple pad voices with independent pan LFOs
- **Character**: Smooth collective movement, group cohesion
- **Performance**: 2-4 voices with filtered waveforms
- **Key Parameters**: `voiceCount`, `panRate`, `panDepth`

### Rung 7: Synthetic Chimes

- **Algorithm**: FM bell synthesis, ultra-sparse events
- **Character**: Distant chimes, thought clusters forming
- **Performance**: Event-based, <2 events/minute, long decay
- **Key Parameters**: `chimeDensity`, `fundamentalFreqs`, `decayTime`

### Rung 8: Neural Sonification

- **Algorithm**: Oscillator network with LFO frequency modulation
- **Character**: Computational but not cold, internal adjustments
- **Performance**: 4-8 oscillators, smooth parameter evolution
- **Key Parameters**: `oscillatorCount`, `lfoDepth`, `freqMin/Max`

### Rung 9: Hyperlow Rumble

- **Algorithm**: Sub-bass oscillators + glitchy microsound
- **Character**: Uncanny, beyond organic or silicon
- **Performance**: Very low frequencies (30-60 Hz) + sparse glitches
- **Key Parameters**: `bassFreqMin`, `glitchDensity`, `bassGlitchBalance`

## Implementation Timeline

### Phase 1: Foundation (Week 1)

- [ ] Create BaseAudioModule abstract class
- [ ] Create AudioModuleOrchestrator
- [ ] Implement AudioControl React component
- [ ] Create useAudioModule React hook
- [ ] Write unit tests for base classes

### Phase 2: Simple Modules (Week 2)

- [ ] Implement FilteredNoiseModule
- [ ] Implement AdditiveDroneModule
- [ ] Implement StereoShiftModule
- [ ] Unit tests and performance verification

### Phase 3: Complex Modules (Week 3)

- [ ] Implement GranularCloudModule
- [ ] Implement SparseFMModule
- [ ] Implement SyntheticChimesModule
- [ ] Implement NeuralSonificationModule
- [ ] Configuration tuning

### Phase 4: Advanced Modules (Week 4)

- [ ] Implement MicrosoundModule
- [ ] Implement HyperlowRumbleModule
- [ ] Fine-tune all modules
- [ ] Cross-device testing

### Phase 5: Integration (Week 5)

- [ ] Update Reader.tsx with audio integration
- [ ] Sync audio/visual transitions
- [ ] Implement user controls
- [ ] Performance monitoring
- [ ] Accessibility improvements

### Phase 6: Polish & Testing (Week 6)

- [ ] Performance profiling
- [ ] Memory leak detection
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] User testing for distraction level
- [ ] Final documentation

**Total Estimated Time**: 6 weeks

## Technical Requirements

### Web Audio API Components

- **AudioContext**: Shared context for all modules
- **OscillatorNode**: Tones, drones, LFOs
- **GainNode**: Volume control and envelopes
- **BiquadFilterNode**: Frequency shaping
- **StereoPannerNode**: Spatialization
- **AudioBufferSourceNode**: Granular synthesis
- **AudioWorkletNode**: Custom processing
- **DynamicsCompressorNode**: Master limiting

### Performance Targets

- **CPU Usage**: < 5% per module (desktop), < 10% (mobile)
- **Memory**: < 10 MB per module
- **Latency**: < 50ms parameter changes
- **Startup**: < 200ms initialization
- **No Memory Leaks**: Flat profile over 30+ minutes
- **No Artifacts**: Zero clicks, pops, glitches

### Browser Support

- Modern browsers with Web Audio API
- Graceful degradation (audio optional)
- Feature detection for AudioWorklet
- Mobile optimization

### Accessibility

- Respect `prefers-reduced-motion`
- Easy mute/volume controls
- No sudden loud sounds
- Visual audio status indicators
- Keyboard-accessible controls

## Configuration System

All modules configured through `audioConfig.json`:

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
        // ... module-specific parameters
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

## Integration with Visual Modules

### Coordinated Transitions

Audio and visual transitions happen simultaneously:

```typescript
const handleChapterTransition = async (newChapterIndex: number) => {
  await Promise.all([
    visualOrchestrator.transitionTo(newChapterIndex),
    audioOrchestrator.transitionTo(newChapterIndex)
  ]);
};
```

### Shared Timing

Both systems use similar timing parameters:
- Visual fade: 1200ms
- Audio crossfade: 3000ms (longer for smoother blend)
- Combined effect: Seamless multi-sensory transition

### User Controls

Simple, unified control panel:
- **Visual toggle**: Enable/disable visual modules
- **Audio toggle**: Enable/disable audio modules
- **Audio volume**: Global volume slider
- **Mute**: Quick audio mute button

## Testing Strategy

### Unit Tests
- Lifecycle methods for each module
- Configuration updates
- Fade in/out functionality
- Cleanup verification

### Integration Tests
- Module switching via orchestrator
- Smooth transitions
- AudioContext sharing
- Performance under load

### Audio Quality Tests
- Manual listening tests
- Frequency analysis
- Distortion testing
- Cross-device consistency

### User Testing
- Distraction level assessment
- Volume appropriateness
- Aesthetic fit
- Control usability

## Success Criteria

### Functional
- ✅ All 9 modules implemented
- ✅ Smooth transitions
- ✅ No memory leaks
- ✅ Configuration working
- ✅ User controls functional

### Audio Quality
- ✅ Reflects chapter themes
- ✅ Enhances without distracting
- ✅ Consistent sonic palette
- ✅ No artifacts
- ✅ Appropriate volumes

### Performance
- ✅ CPU < 5% (desktop), < 10% (mobile)
- ✅ Memory < 10 MB per module
- ✅ No memory growth
- ✅ Smooth UI performance

### Accessibility
- ✅ Respects prefers-reduced-motion
- ✅ Easy to disable
- ✅ Doesn't interfere with text
- ✅ Keyboard accessible

## Risk Mitigation

### Performance Risks
- **Mitigation**: Use AudioWorklets for heavy processing
- **Mitigation**: Limit oscillator count
- **Mitigation**: Performance monitoring
- **Mitigation**: Mobile-specific optimizations

### Browser Compatibility
- **Mitigation**: Feature detection
- **Mitigation**: Graceful degradation
- **Mitigation**: Cross-browser CI testing

### Audio Distraction
- **Mitigation**: Very low default volume
- **Mitigation**: Sparse, non-rhythmic sounds
- **Mitigation**: User testing
- **Mitigation**: Easy mute controls

### Memory Leaks
- **Mitigation**: Strict destroy() implementation
- **Mitigation**: React cleanup hooks
- **Mitigation**: Memory profiling
- **Mitigation**: Automated leak detection

## Next Steps

1. **Review and Approve**: Stakeholder review of planning documents
2. **Phase 1 Start**: Begin implementation of base classes
3. **Prototype**: Create first module (FilteredNoise) to validate architecture
4. **Iterate**: Gather feedback and refine approach
5. **Scale**: Implement remaining modules
6. **Integrate**: Connect with visual modules and reader
7. **Polish**: User testing and refinement

## References

### Web Audio API
- MDN Web Audio API documentation
- W3C Web Audio API specification
- AudioWorklet best practices

### Sound Design
- Brian Eno - ambient music theory
- Generative music systems
- Non-intrusive interface sounds
- Spatial audio for web

### Algorithms
- Pink noise generation
- Granular synthesis techniques
- FM synthesis mathematics
- Microsound composition

## Conclusion

This planning documentation provides a comprehensive roadmap for adding generative audio modules to complement the existing visual modules in the Unsung Heroes interactive reader. The plan:

✅ **Mirrors Visual Architecture**: Uses same patterns and structures  
✅ **9 Audio Algorithms**: Detailed specifications matching each rung  
✅ **Non-Distracting Design**: Carefully tuned ambient soundscapes  
✅ **Performance Optimized**: Clear targets for CPU and memory  
✅ **Accessible**: User controls and motion-sensitivity support  
✅ **Complete Documentation**: Implementation plan, technical specs, and developer guides  
✅ **Timeline**: 6-week implementation schedule with clear phases

The audio modules will work in harmony with the visual modules to create a complete multi-sensory experience that deepens the philosophical and emotional impact of the story without ever distracting from the text itself.

---

**Document Version**: 1.0  
**Created**: 2025-12-03  
**Status**: Planning Complete - Ready for Implementation  
**Next Phase**: Foundation (Week 1) - Base classes and infrastructure
