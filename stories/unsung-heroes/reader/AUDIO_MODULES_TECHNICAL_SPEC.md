# Audio Modules Technical Specification

## Overview

This document provides detailed technical specifications for each audio module in the Unsung Heroes interactive reader. Each module is designed to create ambient, non-distracting soundscapes that complement the visual modules and enhance the thematic atmosphere of each evolutionary rung.

## Table of Contents

1. [Module 1: Filtered Noise (Rung 1)](#module-1-filtered-noise-rung-1)
2. [Module 2: Granular Cloud (Rung 2)](#module-2-granular-cloud-rung-2)
3. [Module 3: Sparse FM (Rung 3)](#module-3-sparse-fm-rung-3)
4. [Module 4: Microsound (Rung 4)](#module-4-microsound-rung-4)
5. [Module 5: Additive Drone (Rung 5)](#module-5-additive-drone-rung-5)
6. [Module 6: Stereo Shift (Rung 6)](#module-6-stereo-shift-rung-6)
7. [Module 7: Synthetic Chimes (Rung 7)](#module-7-synthetic-chimes-rung-7)
8. [Module 8: Neural Sonification (Rung 8)](#module-8-neural-sonification-rung-8)
9. [Module 9: Hyperlow Rumble (Rung 9)](#module-9-hyperlow-rumble-rung-9)

---

## Module 1: Filtered Noise (Rung 1)

**Chapter**: Pre-cellular replicators  
**Theme**: Chemical persistence  
**Visual**: DLA (Diffusion-Limited Aggregation)

### Algorithm Description

Combines continuous pink/brown noise with ultra-rare granular events to create a primordial soundscape. The noise represents the diffuse chemical soup while occasional soft grains suggest proto-replication events.

### Audio Components

1. **Pink Noise Generator**
   - Continuous low-amplitude pink noise
   - Slowly modulated bandpass filter
   - LFO controls filter frequency (20-60 second cycle)

2. **Grain Generator**
   - Ultra-sparse grain events (< 0.1% density)
   - Very short duration (100-300ms)
   - Soft attack/release envelopes

### Configuration Parameters

```typescript
interface FilteredNoiseConfig extends AudioModuleConfig {
  // Noise parameters
  noiseType: 'pink' | 'brown';           // Spectral shape
  noiseGain: number;                     // 0.0 - 1.0 (very low)
  
  // Filter parameters
  filterFrequency: number;               // Center frequency (Hz)
  filterQ: number;                       // Resonance
  filterModulationRate: number;          // LFO rate (Hz)
  filterModulationDepth: number;         // LFO depth (Hz)
  
  // Grain parameters
  grainDensity: number;                  // Events per second
  grainDuration: number;                 // Duration (seconds)
  grainPitchMin: number;                 // Min pitch (Hz)
  grainPitchMax: number;                 // Max pitch (Hz)
  grainGain: number;                     // Grain volume
}
```

### Default Configuration

```json
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
    "noiseGain": 0.12,
    "filterFrequency": 300,
    "filterQ": 0.5,
    "filterModulationRate": 0.02,
    "filterModulationDepth": 40,
    "grainDensity": 0.001,
    "grainDuration": 0.2,
    "grainPitchMin": 150,
    "grainPitchMax": 250,
    "grainGain": 0.08
  }
}
```

### Implementation Notes

- Use AudioWorklet for pink noise generation
- Pre-generate noise buffer for efficiency
- Schedule grain events probabilistically
- Apply gentle compression to prevent peaks

### Expected Sound Character

A soft, cosmic hum with occasional barely-audible glints. Feels like distant static or the sound of space itself.

---

## Module 2: Granular Cloud (Rung 2)

**Chapter**: Protocells  
**Theme**: Boundary control  
**Visual**: Reaction-Diffusion

### Algorithm Description

Slow-moving granular texture cloud representing chemical morphogenesis. Grains are scattered across the stereo field with low density and slow evolution, creating a diffuse, morphing soundscape.

### Audio Components

1. **Granular Engine**
   - Multiple concurrent grains (5-15)
   - Random positioning in stereo field
   - Varying grain sizes and pitches
   - Soft Gaussian envelopes

2. **Source Material**
   - Synthesized base tones (sine/triangle waves)
   - Very low fundamental frequencies
   - Slowly evolving harmonic content

### Configuration Parameters

```typescript
interface GranularCloudConfig extends AudioModuleConfig {
  // Grain density
  minConcurrentGrains: number;          // Minimum active grains
  maxConcurrentGrains: number;          // Maximum active grains
  spawnRate: number;                    // Grains per second
  
  // Grain characteristics
  grainDurationMin: number;             // Min duration (seconds)
  grainDurationMax: number;             // Max duration (seconds)
  grainPitchMin: number;                // Min pitch (Hz)
  grainPitchMax: number;                // Max pitch (Hz)
  grainPitchVariation: number;          // Pitch randomization
  
  // Spatial parameters
  stereoSpread: number;                 // 0.0 - 1.0
  spatialMovement: number;              // Pan drift rate
  
  // Timbre
  grainShape: 'sine' | 'triangle';      // Waveform
  envelopeShape: 'linear' | 'gaussian'; // Envelope type
}
```

### Default Configuration

```json
{
  "chapterId": 2,
  "moduleName": "GranularCloud",
  "enabled": true,
  "config": {
    "masterGain": 0.18,
    "panWidth": 0.5,
    "lowCutoff": 80,
    "highCutoff": 800,
    "density": 0.3,
    "complexity": 0.4,
    "minConcurrentGrains": 5,
    "maxConcurrentGrains": 12,
    "spawnRate": 0.5,
    "grainDurationMin": 0.5,
    "grainDurationMax": 2.0,
    "grainPitchMin": 120,
    "grainPitchMax": 300,
    "grainPitchVariation": 0.15,
    "stereoSpread": 0.6,
    "spatialMovement": 0.03,
    "grainShape": "triangle",
    "envelopeShape": "gaussian"
  }
}
```

### Implementation Notes

- Use AudioBufferSourceNode for each grain
- Implement grain pool for performance
- Pan position evolves slowly over time
- Gentle master compression

### Expected Sound Character

Soft murmuring texture, like distant cellular processes. Diffuse and cloud-like, with gentle spatial movement.

---

## Module 3: Sparse FM (Rung 3)

**Chapter**: RNA-world organisms  
**Theme**: Replication fidelity  
**Visual**: L-systems

### Algorithm Description

Very sparse FM synthesis events representing discrete replication attempts. Long intervals between events with randomized pitch to avoid pattern recognition. Each event is a brief FM tone with soft envelope.

### Audio Components

1. **FM Event Generator**
   - Carrier and modulator oscillators
   - Simple 2-operator FM
   - Random pitch within narrow window
   - Exponential decay envelope

2. **Event Scheduler**
   - Probabilistic triggering
   - Variable inter-event timing
   - Adaptive density based on config

### Configuration Parameters

```typescript
interface SparseFMConfig extends AudioModuleConfig {
  // Event timing
  eventDensity: number;                 // Events per minute
  eventVariation: number;               // Timing randomization (0-1)
  
  // FM synthesis
  carrierFreqMin: number;               // Min carrier (Hz)
  carrierFreqMax: number;               // Max carrier (Hz)
  modulatorRatio: number;               // Modulator/carrier ratio
  modulationIndex: number;              // FM intensity
  
  // Envelope
  attackTime: number;                   // Attack (seconds)
  decayTime: number;                    // Decay (seconds)
  peakGain: number;                     // Event volume
  
  // Timbre
  carrierType: 'sine' | 'triangle';
  modulatorType: 'sine' | 'triangle';
}
```

### Default Configuration

```json
{
  "chapterId": 3,
  "moduleName": "SparseFM",
  "enabled": true,
  "config": {
    "masterGain": 0.16,
    "panWidth": 0.4,
    "lowCutoff": 150,
    "highCutoff": 1000,
    "density": 0.25,
    "complexity": 0.35,
    "eventDensity": 3,
    "eventVariation": 0.7,
    "carrierFreqMin": 200,
    "carrierFreqMax": 350,
    "modulatorRatio": 2.0,
    "modulationIndex": 50,
    "attackTime": 0.1,
    "decayTime": 0.6,
    "peakGain": 0.12,
    "carrierType": "sine",
    "modulatorType": "sine"
  }
}
```

### Implementation Notes

- Create and destroy nodes for each event
- Use precise scheduling with AudioContext.currentTime
- Implement proper cleanup after events
- Randomize pan position per event

### Expected Sound Character

Barely audible glints of emerging order. Like quiet digital bleeps scattered across time, suggesting discrete replication events.

---

## Module 4: Microsound (Rung 4)

**Chapter**: Early cells  
**Theme**: Metabolic efficiency  
**Visual**: Cellular Automata

### Algorithm Description

Light crackling and popping sounds representing discrete state transitions. Uses bitcrushing and sample-rate reduction to create digital grain texture. Very sparse event density with random timing.

### Audio Components

1. **Glitch Generator**
   - Random bit-depth reduction
   - Sample-rate manipulation
   - Brief noise bursts

2. **Event Processor**
   - Sparse triggering
   - Variable glitch intensity
   - Short duration events

### Configuration Parameters

```typescript
interface MicrosoundConfig extends AudioModuleConfig {
  // Event characteristics
  crackleRate: number;                  // Events per second
  crackleIntensity: number;             // 0.0 - 1.0
  crackleDuration: number;              // Event duration (seconds)
  
  // Digital distortion
  bitDepth: number;                     // Bits (8-16)
  bitDepthVariation: number;            // Randomization
  sampleRateReduction: number;          // Downsampling factor
  
  // Filtering
  filterFreq: number;                   // Highpass cutoff (Hz)
  
  // Spatial
  panRandomization: number;             // 0.0 - 1.0
}
```

### Default Configuration

```json
{
  "chapterId": 4,
  "moduleName": "Microsound",
  "enabled": true,
  "config": {
    "masterGain": 0.14,
    "panWidth": 0.5,
    "lowCutoff": 200,
    "highCutoff": 2000,
    "density": 0.3,
    "complexity": 0.4,
    "crackleRate": 0.5,
    "crackleIntensity": 0.3,
    "crackleDuration": 0.05,
    "bitDepth": 12,
    "bitDepthVariation": 3,
    "sampleRateReduction": 4,
    "filterFreq": 300,
    "panRandomization": 0.7
  }
}
```

### Implementation Notes

- Use AudioWorklet for bitcrushing
- Generate noise bursts procedurally
- Keep CPU usage minimal with sparse events
- Apply highpass to reduce muddiness

### Expected Sound Character

Tiny digital errors. Sparse popping and crackling, like quiet static from a digital system. Non-musical but not harsh.

---

## Module 5: Additive Drone (Rung 5)

**Chapter**: Multicellular life  
**Theme**: Specialization  
**Visual**: Morphogenetic Growth

### Algorithm Description

Meditative additive synthesis drone built from 3-5 sine waves with slowly shifting phases. Creates harmonic richness suggesting coordination and organization. Very stable with gentle evolution.

### Audio Components

1. **Oscillator Stack**
   - 3-5 sine wave oscillators
   - Harmonic or inharmonic tuning
   - Individual LFOs for each oscillator

2. **Phase Modulation**
   - Slow phase drift
   - Creates subtle beating patterns
   - Evolves over minutes, not seconds

### Configuration Parameters

```typescript
interface AdditiveDroneConfig extends AudioModuleConfig {
  // Oscillator setup
  oscillatorCount: number;              // 2-6 oscillators
  fundamentalFreq: number;              // Base frequency (Hz)
  harmonic: boolean;                    // Harmonic vs inharmonic
  harmonicRatios: number[];             // Frequency ratios
  
  // Modulation
  phaseDriftRate: number;               // LFO rate (Hz)
  phaseDriftDepth: number;              // Modulation depth
  amplitudeVariation: number;           // Volume fluctuation
  
  // Timbre
  oscillatorGains: number[];            // Relative volumes
  detuning: number;                     // Slight mistuning (cents)
}
```

### Default Configuration

```json
{
  "chapterId": 5,
  "moduleName": "AdditiveDrone",
  "enabled": true,
  "config": {
    "masterGain": 0.17,
    "panWidth": 0.3,
    "lowCutoff": 60,
    "highCutoff": 800,
    "density": 0.5,
    "complexity": 0.5,
    "oscillatorCount": 4,
    "fundamentalFreq": 110,
    "harmonic": true,
    "harmonicRatios": [1.0, 2.0, 3.0, 4.0],
    "phaseDriftRate": 0.01,
    "phaseDriftDepth": 0.3,
    "amplitudeVariation": 0.15,
    "oscillatorGains": [1.0, 0.5, 0.3, 0.2],
    "detuning": 5
  }
}
```

### Implementation Notes

- Use OscillatorNode for each partial
- Implement LFOs for phase modulation
- Careful tuning to avoid dissonance
- Very gradual parameter changes

### Expected Sound Character

Meditative, non-melodic ambience. Presence without rhythm. Like an organ drone but more organic and evolving.

---

## Module 6: Stereo Shift (Rung 6)

**Chapter**: Sentient animals  
**Theme**: Behavioral strategy  
**Visual**: Boids (Flocking)

### Algorithm Description

Soft synthesizer pads that shift slowly across the stereo field, representing group cohesion and movement. Multiple layers with independent panning create sense of collective behavior.

### Audio Components

1. **Pad Voices**
   - 2-4 concurrent pad voices
   - Triangle or filtered square waves
   - Each with independent pan LFO

2. **Stereo Movement**
   - Slow pan automation (30-90 second cycles)
   - Phase-shifted LFOs for natural movement
   - Occasional convergence/divergence

### Configuration Parameters

```typescript
interface StereoShiftConfig extends AudioModuleConfig {
  // Voice configuration
  voiceCount: number;                   // 2-5 voices
  voiceFreqs: number[];                 // Base frequencies
  voiceWaveform: 'sine' | 'triangle' | 'square';
  
  // Stereo movement
  panRate: number;                      // Pan LFO rate (Hz)
  panDepth: number;                     // 0.0 - 1.0
  panPhaseOffset: number;               // Phase between voices
  
  // Envelope
  attackTime: number;                   // Global attack
  releaseTime: number;                  // Global release
  
  // Filter
  filterCutoff: number;                 // Lowpass frequency
  filterResonance: number;              // Q factor
}
```

### Default Configuration

```json
{
  "chapterId": 6,
  "moduleName": "StereoShift",
  "enabled": true,
  "config": {
    "masterGain": 0.16,
    "panWidth": 0.8,
    "lowCutoff": 80,
    "highCutoff": 1200,
    "density": 0.4,
    "complexity": 0.45,
    "voiceCount": 3,
    "voiceFreqs": [165, 220, 330],
    "voiceWaveform": "triangle",
    "panRate": 0.015,
    "panDepth": 0.7,
    "panPhaseOffset": 0.33,
    "attackTime": 2.0,
    "releaseTime": 3.0,
    "filterCutoff": 800,
    "filterResonance": 0.5
  }
}
```

### Implementation Notes

- Use StereoPannerNode or PannerNode
- LFOs control pan position smoothly
- Filter to soften timbre
- Gentle crossfade on transitions

### Expected Sound Character

Soft shifting stereo pads suggesting group behavior. Smooth, cohesive movement without twitching or jarring changes.

---

## Module 7: Synthetic Chimes (Rung 7)

**Chapter**: Humans  
**Theme**: Abstraction and representation  
**Visual**: Force-Directed Graph

### Algorithm Description

Very slow, gentle synthetic chimes representing thought clusters forming and connecting. Each chime is a brief FM bell tone with long decay. Ultra-sparse timing creates contemplative atmosphere.

### Audio Components

1. **Chime Synthesizer**
   - FM bell algorithm
   - Exponential decay envelope
   - Random pitch selection from scale

2. **Event Scheduler**
   - Very sparse (< 2 events per minute)
   - Randomized timing
   - Occasional clusters (2-3 chimes)

### Configuration Parameters

```typescript
interface SyntheticChimesConfig extends AudioModuleConfig {
  // Event timing
  chimeDensity: number;                 // Events per minute
  clusterProbability: number;           // Chance of cluster
  clusterSize: number;                  // Events in cluster
  
  // Chime synthesis
  fundamentalFreqs: number[];           // Pitch pool (Hz)
  inharmonicity: number;                // Bell-like quality
  brightness: number;                   // Spectral richness
  
  // Envelope
  attackTime: number;
  decayTime: number;
  peakGain: number;
  
  // Spatial
  stereoVariation: number;              // Pan randomization
}
```

### Default Configuration

```json
{
  "chapterId": 7,
  "moduleName": "SyntheticChimes",
  "enabled": true,
  "config": {
    "masterGain": 0.15,
    "panWidth": 0.6,
    "lowCutoff": 200,
    "highCutoff": 3000,
    "density": 0.2,
    "complexity": 0.3,
    "chimeDensity": 1.5,
    "clusterProbability": 0.2,
    "clusterSize": 3,
    "fundamentalFreqs": [330, 440, 550, 660],
    "inharmonicity": 0.05,
    "brightness": 0.4,
    "attackTime": 0.01,
    "decayTime": 4.0,
    "peakGain": 0.18,
    "stereoVariation": 0.5
  }
}
```

### Implementation Notes

- Use FM synthesis for bell-like tones
- Inharmonic partials for realism
- Very long decay times
- Sparse scheduling critical

### Expected Sound Character

Gentle synthetic chimes, very slow. Like distant bells or wind chimes representing abstract thoughts forming connections.

---

## Module 8: Neural Sonification (Rung 8)

**Chapter**: Machine minds  
**Theme**: Architecture of thought  
**Visual**: Neural Activation Field

### Algorithm Description

Multiple sine oscillators with frequencies shifting through a parameter space, creating a computational feel. LFOs control oscillator frequencies to suggest internal adjustments and optimization.

### Audio Components

1. **Oscillator Network**
   - 4-8 sine oscillators
   - Frequency modulation by LFOs
   - Creates shifting harmonic relationships

2. **Parameter Space Navigation**
   - LFOs represent weight adjustments
   - Slow continuous evolution
   - Occasional rapid shifts (learning events)

### Configuration Parameters

```typescript
interface NeuralSonificationConfig extends AudioModuleConfig {
  // Network structure
  oscillatorCount: number;              // 4-10 oscillators
  freqMin: number;                      // Minimum frequency
  freqMax: number;                      // Maximum frequency
  
  // Modulation
  lfoCount: number;                     // LFOs driving frequencies
  lfoRateMin: number;                   // Slow LFO rate
  lfoRateMax: number;                   // Fast LFO rate
  lfoDepth: number;                     // Frequency deviation
  
  // Learning events
  eventProbability: number;             // Sudden shift chance
  eventMagnitude: number;               // Shift size
  
  // Timbre
  oscillatorGains: number[];            // Relative volumes
}
```

### Default Configuration

```json
{
  "chapterId": 8,
  "moduleName": "NeuralSonification",
  "enabled": true,
  "config": {
    "masterGain": 0.16,
    "panWidth": 0.4,
    "lowCutoff": 100,
    "highCutoff": 1500,
    "density": 0.4,
    "complexity": 0.6,
    "oscillatorCount": 6,
    "freqMin": 150,
    "freqMax": 600,
    "lfoCount": 3,
    "lfoRateMin": 0.01,
    "lfoRateMax": 0.05,
    "lfoDepth": 50,
    "eventProbability": 0.02,
    "eventMagnitude": 100,
    "oscillatorGains": [1.0, 0.8, 0.6, 0.5, 0.4, 0.3]
  }
}
```

### Implementation Notes

- Connect LFOs to oscillator frequencies
- Use automation for smooth transitions
- Implement occasional parameter jumps
- Keep timbre clean and synthetic

### Expected Sound Character

Computational but not cold. Shifting sine clusters suggesting internal structure adjusting. Precise aesthetic reflecting machine cognition.

---

## Module 9: Hyperlow Rumble (Rung 9)

**Chapter**: Successor  
**Theme**: Beyond comprehension  
**Visual**: Hyperbolic/Quasicrystal

### Algorithm Description

Combination of very low sub-bass rumbles and glitchy microsound texture. Represents something beyond organic or silicon intelligence. Uncanny and slightly unsettling without being harsh.

### Audio Components

1. **Sub-bass Generator**
   - Ultra-low sine/triangle waves (30-60 Hz)
   - Random amplitude modulation
   - Very quiet but felt more than heard

2. **Glitch Layer**
   - Bitcrushed noise bursts
   - Random sample-rate reduction
   - Sparse but unpredictable

### Configuration Parameters

```typescript
interface HyperlowRumbleConfig extends AudioModuleConfig {
  // Sub-bass
  bassFreqMin: number;                  // Minimum frequency
  bassFreqMax: number;                  // Maximum frequency
  bassModRate: number;                  // Modulation rate
  bassGain: number;                     // Volume (very low)
  
  // Glitch layer
  glitchDensity: number;                // Events per second
  glitchIntensity: number;              // Distortion amount
  glitchDuration: number;               // Event duration
  bitDepthMin: number;                  // Min bits
  bitDepthMax: number;                  // Max bits
  
  // Mix
  bassGlitchBalance: number;            // 0=bass, 1=glitch
}
```

### Default Configuration

```json
{
  "chapterId": 9,
  "moduleName": "HyperlowRumble",
  "enabled": true,
  "config": {
    "masterGain": 0.20,
    "panWidth": 0.5,
    "lowCutoff": 30,
    "highCutoff": 2500,
    "density": 0.35,
    "complexity": 0.7,
    "bassFreqMin": 35,
    "bassFreqMax": 55,
    "bassModRate": 0.03,
    "bassGain": 0.25,
    "glitchDensity": 0.3,
    "glitchIntensity": 0.4,
    "glitchDuration": 0.08,
    "bitDepthMin": 8,
    "bitDepthMax": 14,
    "bassGlitchBalance": 0.4
  }
}
```

### Implementation Notes

- Sub-bass must be very careful on mobile
- Add safety limiter to prevent speaker damage
- Use AudioWorklet for glitch processing
- Test extensively on various systems

### Expected Sound Character

Beyond organic or silicon. Uncanny, slightly unsettling but quiet. Sub-bass provides geological undertone while glitches add digital strangeness.

---

## Cross-Module Considerations

### Transition Management

All modules must support smooth crossfades:

```typescript
interface TransitionSupport {
  fadeIn(duration: number): void;
  fadeOut(duration: number): void;
  crossfadeTo(nextModule: AudioModule, duration: number): void;
}
```

### Performance Optimization

- **CPU Budget**: < 5% per module
- **Memory Budget**: < 10 MB per module
- **Latency**: < 50ms parameter changes
- **No Clicks**: Proper ramping on all gain changes

### Safety Features

1. **Master Limiter**
   - DynamicsCompressorNode on master output
   - Threshold: -6 dB
   - Ratio: 4:1
   - Attack: 0.003s, Release: 0.25s

2. **Highpass Filter**
   - Global highpass at 20-30 Hz
   - Prevents DC offset
   - Protects speakers

3. **Emergency Mute**
   - Immediate silence on user request
   - Disconnect all sources
   - Release all resources

### Browser Compatibility

All modules tested on:
- Chrome/Edge (Chromium)
- Firefox
- Safari (desktop and iOS)

Fallback strategies for limited Web Audio support.

### iOS Audio Handling

iOS has strict autoplay policies that require special handling:

**AudioContext State Management**:
- AudioContext starts in 'suspended' state on iOS
- Can only be resumed in direct response to user gestures (touch, click, keydown)
- Can enter 'interrupted' state (iOS-specific) when app backgrounds or tabs switch
- Must be explicitly resumed after each interruption

**Implementation Strategy**:
1. **Initial Unlock**: AudioContext must be created and resumed during a user gesture (e.g., clicking the audio control button)
2. **Continuous Monitoring**: Global event listeners on user interaction events (`touchstart`, `touchend`, `click`, `mousedown`, `keydown`) automatically resume the context if suspended/interrupted
3. **Visibility Handling**: When tab becomes visible again after backgrounding, attempt to resume AudioContext
4. **State Checking**: Always check for both 'suspended' AND 'interrupted' states before audio operations

**Key Events Monitored**:
```typescript
const events = ['touchstart', 'touchend', 'mousedown', 'click', 'keydown'];
events.forEach(event => {
  document.addEventListener(event, resumeOnUserGesture, { passive: true });
});
```

**Known iOS Quirks**:
- Silent mode may prevent Web Audio output (different from `<audio>` elements)
- iOS 17+ has had regressions in AudioContext handling
- Context can re-suspend between user interactions
- Must avoid calling audio node `.start()` when context is not in 'running' state

**Reference**: See `useAudioModule` hook for full implementation of iOS-compatible AudioContext management.

---

## Testing Procedures

### Unit Testing

Each module must pass:
- [ ] Lifecycle: init, start, stop, destroy
- [ ] Config: update parameters without glitches
- [ ] Cleanup: no memory leaks after destroy
- [ ] Performance: CPU < 5%, memory < 10MB

### Audio Quality Testing

- [ ] No clicks, pops, or artifacts
- [ ] Appropriate volume levels
- [ ] Correct stereo behavior
- [ ] Smooth transitions
- [ ] Matches aesthetic intent

### Integration Testing

- [ ] Works with AudioModuleOrchestrator
- [ ] Crossfades smoothly
- [ ] Respects global settings
- [ ] Mobile performance acceptable

### User Testing

- [ ] Not distracting from text
- [ ] Enhances atmosphere
- [ ] Volume feels right
- [ ] Controls are intuitive

---

## Implementation Priority

### Phase 1 (Simple)
1. FilteredNoise
2. AdditiveDrone
3. StereoShift

### Phase 2 (Medium)
4. SparseFM
5. SyntheticChimes
6. NeuralSonification

### Phase 3 (Complex)
7. GranularCloud
8. Microsound
9. HyperlowRumble

---

## Conclusion

This technical specification provides complete implementation details for all nine audio modules. Each module is designed to:

- Complement its corresponding visual module
- Create appropriate atmosphere for the chapter theme
- Remain subtle and non-distracting
- Perform efficiently across devices
- Integrate smoothly with the reader experience

The specifications balance technical precision with creative expression, ensuring each module enhances the philosophical depth and emotional impact of the Unsung Heroes story.

---

**Document Version**: 1.0  
**Created**: 2025-12-03  
**Last Updated**: 2025-12-03  
**Status**: Complete - Ready for Implementation
