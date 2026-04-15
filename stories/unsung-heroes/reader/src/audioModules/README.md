# Audio Modules

This directory contains the generative audio modules for the Unsung Heroes interactive reader. Each module creates atmospheric background soundscapes that reflect the theme of its corresponding evolutionary rung (chapter) while remaining subtle and non-distracting.

## Directory Structure

```
audioModules/
├── README.md                       # This file
├── index.ts                        # Export all modules
├── AudioModuleTypes.ts             # TypeScript interfaces and types
├── BaseAudioModule.ts              # Abstract base class
├── AudioModuleOrchestrator.ts      # Lifecycle management
├── config/
│   └── audioConfig.json            # Configuration for all modules
├── modules/
│   ├── FilteredNoiseModule.ts      # Rung 1: Pink/brown noise
│   ├── GranularCloudModule.ts      # Rung 2: Granular textures
│   ├── SparseFMModule.ts           # Rung 3: FM bleeps
│   ├── MicrosoundModule.ts         # Rung 4: Glitch textures
│   ├── AdditiveDroneModule.ts      # Rung 5: Harmonic drones
│   ├── StereoShiftModule.ts        # Rung 6: Shifting pads
│   ├── SyntheticChimesModule.ts    # Rung 7: Gentle chimes
│   ├── NeuralSonificationModule.ts # Rung 8: Neural activation
│   └── HyperlowRumbleModule.ts     # Rung 9: Sub-bass + glitch
├── components/
│   └── AudioControl.tsx            # React component for controls
└── hooks/
    └── useAudioModule.ts           # React hook for module lifecycle
```

## Design Principles

All audio modules follow these core principles:

1. **Ambient-First**: Background textures, never foreground music
2. **Non-Rhythmic**: No beats or patterns the brain can lock onto
3. **Sparse**: Long intervals between discrete events
4. **Quiet**: Default gain at -26 dB to -18 dB
5. **Subtle**: No sharp attacks, no percussive envelopes
6. **Complementary**: Audio follows visual transitions smoothly

## Quick Start

### Using an Audio Module

```typescript
import { FilteredNoiseModule } from './audioModules';
import audioConfig from './audioModules/config/audioConfig.json';

// Initialize AudioContext (must be after user interaction)
const audioContext = new AudioContext();

// Get configuration for chapter 1
const config = audioConfig.modules.find(m => m.chapterId === 1)?.config;

// Create and initialize module
const module = new FilteredNoiseModule();
module.init(audioContext, config);

// Start playback
module.start();

// Fade out and clean up when done
module.fadeOut(2.0);
setTimeout(() => {
  module.stop();
  module.destroy();
}, 2000);
```

### Using the Orchestrator

```typescript
import { AudioModuleOrchestrator } from './audioModules';
import audioConfig from './audioModules/config/audioConfig.json';

// Initialize AudioContext
const audioContext = new AudioContext();
const orchestrator = new AudioModuleOrchestrator(audioContext, audioConfig);

// Load module for specific chapter
await orchestrator.loadChapter(1);

// Transition to next chapter
await orchestrator.transitionTo(2);

// Pause/resume
orchestrator.pause();
orchestrator.resume();

// Clean up
orchestrator.destroy();
```

## Module Reference

### Rung 1: Filtered Noise

- **Theme**: Pre-cellular replicators - chemical persistence
- **Sound**: Pink noise with slowly modulated filter + ultra-rare soft grains
- **Character**: Cosmic hum, pre-semantic sound bed
- **Key Parameters**: `noiseType`, `filterModulationRate`, `grainDensity`

### Rung 2: Granular Cloud

- **Theme**: Protocells - boundary control
- **Sound**: Slow granular texture cloud
- **Character**: Soft murmuring, diffuse cellular processes
- **Key Parameters**: `minConcurrentGrains`, `spawnRate`, `stereoSpread`

### Rung 3: Sparse FM

- **Theme**: RNA-world organisms - replication fidelity
- **Sound**: Very sparse FM synthesis bleeps
- **Character**: Barely audible glints of emerging order
- **Key Parameters**: `eventDensity`, `modulatorRatio`, `modulationIndex`

### Rung 4: Microsound

- **Theme**: Early cells - metabolic efficiency
- **Sound**: Light crackling and digital grain texture
- **Character**: Tiny digital errors, sparse popping
- **Key Parameters**: `crackleRate`, `bitDepth`, `sampleRateReduction`

### Rung 5: Additive Drone

- **Theme**: Multicellular life - specialization
- **Sound**: Meditative additive synthesis drone
- **Character**: Harmonic coordination, organ-like presence
- **Key Parameters**: `oscillatorCount`, `harmonicRatios`, `phaseDriftRate`

### Rung 6: Stereo Shift

- **Theme**: Sentient animals - behavioral strategy
- **Sound**: Soft pads shifting across stereo field
- **Character**: Group cohesion, smooth collective movement
- **Key Parameters**: `voiceCount`, `panRate`, `panDepth`

### Rung 7: Synthetic Chimes

- **Theme**: Humans - abstraction and representation
- **Sound**: Very slow, gentle synthetic bell tones
- **Character**: Distant chimes, thought clusters forming
- **Key Parameters**: `chimeDensity`, `fundamentalFreqs`, `decayTime`

### Rung 8: Neural Sonification

- **Theme**: Machine minds - architecture of thought
- **Sound**: Shifting sine clusters with LFO modulation
- **Character**: Computational but not cold, internal adjustments
- **Key Parameters**: `oscillatorCount`, `lfoDepth`, `freqMin`, `freqMax`

### Rung 9: Hyperlow Rumble

- **Theme**: Post-AI successor - beyond comprehension
- **Sound**: Sub-bass rumbles + glitchy microsound
- **Character**: Uncanny, beyond organic or silicon
- **Key Parameters**: `bassFreqMin`, `glitchDensity`, `bassGlitchBalance`

## Common Interface

All modules implement the `AudioModule` interface:

```typescript
interface AudioModule {
  // Lifecycle
  init(audioContext: AudioContext, config: AudioModuleConfig): void;
  start(): void;
  stop(): void;
  destroy(): void;
  
  // Configuration
  updateConfig(config: Partial<AudioModuleConfig>): void;
  getConfig(): AudioModuleConfig;
  
  // State
  pause(): void;
  resume(): void;
  fadeIn(duration: number): void;
  fadeOut(duration: number): void;
}
```

## Configuration

Each module can be configured through `audioConfig.json`. Common parameters include:

- **Volume**: `masterGain`, `panWidth`
- **Filtering**: `lowCutoff`, `highCutoff`
- **Behavior**: `density`, `complexity`
- **Module-specific**: Various parameters unique to each algorithm

### Global Settings

```json
{
  "global": {
    "respectReducedMotion": true,
    "enableAudio": true,
    "defaultVolume": 0.5,
    "maxConcurrentModules": 2,
    "masterCompression": true
  }
}
```

## Performance Considerations

- CPU usage: < 5% per module on desktop, < 10% on mobile
- Memory limit: < 10 MB per module
- Respect `prefers-reduced-motion` media query
- Proper cleanup in `destroy()` to prevent memory leaks
- Use AudioWorkletNode for heavy processing when needed

## Development Guidelines

### Creating a New Module

1. Extend `BaseAudioModule` class
2. Implement required lifecycle methods
3. Add configuration interface to `AudioModuleTypes.ts`
4. Add to module exports in `index.ts`
5. Configure in `audioConfig.json`
6. Update `AudioModuleOrchestrator` module mapping

### Testing

- Unit test lifecycle methods
- Test configuration updates
- Verify cleanup (no memory leaks)
- Audio quality testing on multiple devices
- Performance profiling

### Best Practices

- Keep sounds very quiet (low gain)
- Slow, meditative evolution
- No rapid changes or strobing
- Maintain performance targets
- Proper node disconnection on cleanup
- Use ramps for all gain changes (avoid clicks)

## Browser Compatibility

### AudioContext Initialization

Due to browser autoplay policies, AudioContext must be initialized after user interaction:

```typescript
// Wait for user interaction
document.addEventListener('click', () => {
  const audioContext = new AudioContext();
  // Resume if suspended
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}, { once: true });
```

### Web Audio API Support

All modules require:
- AudioContext
- OscillatorNode
- GainNode
- BiquadFilterNode
- AudioBufferSourceNode (for granular modules)
- StereoPannerNode or PannerNode

Optional (with fallbacks):
- AudioWorkletNode (can fallback to ScriptProcessorNode)
- DynamicsCompressorNode

## Integration with Reader

### Coordination with Visual Modules

Audio transitions sync with visual module transitions:

```typescript
const handleChapterTransition = async (newChapterIndex: number) => {
  await Promise.all([
    visualOrchestrator.transitionTo(newChapterIndex),
    audioOrchestrator.transitionTo(newChapterIndex)
  ]);
};
```

### User Controls

- **Mute/Unmute**: Quick toggle
- **Volume slider**: Adjust overall volume (0-100%)
- **Enable/disable**: Turn audio completely off
- **Accessible**: Keyboard-navigable controls

## Documentation

For detailed implementation plans and technical specifications, see:

- **[AUDIO_MODULES_IMPLEMENTATION_PLAN.md](../AUDIO_MODULES_IMPLEMENTATION_PLAN.md)** - Overall strategy and timeline
- **[AUDIO_MODULES_TECHNICAL_SPEC.md](../AUDIO_MODULES_TECHNICAL_SPEC.md)** - Detailed algorithm specifications

## Status

**Current Phase**: Planning complete

### Implementation Checklist

- [x] Create project structure
- [x] Define TypeScript interfaces
- [x] Create configuration template
- [x] Write implementation plan
- [x] Write technical specifications
- [ ] Implement BaseAudioModule
- [ ] Implement AudioModuleOrchestrator
- [ ] Create individual modules (9 total)
- [ ] Integrate with Reader component
- [ ] Testing and optimization
- [ ] Documentation and examples

## Safety and Accessibility

### Volume Safety

- Default very low volume (-26 to -18 dB)
- Master limiter to prevent peaks
- Highpass filter to protect speakers
- Emergency mute capability

### Accessibility

- Respects `prefers-reduced-motion`
- Easy to disable completely
- Visual indicators for audio status
- Keyboard-accessible controls
- No sudden loud sounds

## License

Part of the "Unsung Heroes" creative writing project.
