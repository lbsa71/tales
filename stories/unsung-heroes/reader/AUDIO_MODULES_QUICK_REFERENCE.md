# Audio Modules Quick Reference

## Quick Start Guide

### Basic Setup

```typescript
import { AudioModuleOrchestrator } from './audioModules';
import audioConfig from './audioModules/config/audioConfig.json';

// Initialize AudioContext after user interaction
const audioContext = new AudioContext();

// Create orchestrator
const orchestrator = new AudioModuleOrchestrator(audioContext, audioConfig);

// Load chapter 1
await orchestrator.loadChapter(1);

// Transition to chapter 2
await orchestrator.transitionTo(2);

// Clean up
orchestrator.destroy();
```

### Browser Compatibility Check

```typescript
// Check for Web Audio API support
const hasWebAudio = !!(window.AudioContext || window.webkitAudioContext);

if (!hasWebAudio) {
  console.warn('Web Audio API not supported');
  // Fall back to visual-only mode
}

// Initialize after user interaction (required by browsers)
document.addEventListener('click', () => {
  const audioContext = new AudioContext();
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}, { once: true });
```

## Module Quick Reference

### 1. Filtered Noise (Rung 1)

**Sound**: Pink noise + rare grains  
**Volume**: 0.15 (very quiet)  
**Use Case**: Primordial, diffuse atmosphere

```json
{
  "noiseType": "pink",
  "filterModulationRate": 0.02,
  "grainDensity": 0.001
}
```

### 2. Granular Cloud (Rung 2)

**Sound**: Soft granular textures  
**Volume**: 0.18  
**Use Case**: Chemical morphogenesis

```json
{
  "minConcurrentGrains": 5,
  "maxConcurrentGrains": 12,
  "grainShape": "triangle"
}
```

### 3. Sparse FM (Rung 3)

**Sound**: Occasional FM bleeps  
**Volume**: 0.16  
**Use Case**: Discrete replication events

```json
{
  "eventDensity": 3,
  "modulatorRatio": 2.0,
  "modulationIndex": 50
}
```

### 4. Microsound (Rung 4)

**Sound**: Digital crackles  
**Volume**: 0.14  
**Use Case**: State transitions

```json
{
  "crackleRate": 0.5,
  "bitDepth": 12,
  "crackleIntensity": 0.3
}
```

### 5. Additive Drone (Rung 5)

**Sound**: Harmonic drone  
**Volume**: 0.17  
**Use Case**: Coordination, stability

```json
{
  "oscillatorCount": 4,
  "fundamentalFreq": 110,
  "harmonic": true
}
```

### 6. Stereo Shift (Rung 6)

**Sound**: Panning pads  
**Volume**: 0.16  
**Use Case**: Group movement

```json
{
  "voiceCount": 3,
  "panRate": 0.015,
  "panDepth": 0.7
}
```

### 7. Synthetic Chimes (Rung 7)

**Sound**: Gentle bells  
**Volume**: 0.15  
**Use Case**: Thought formation

```json
{
  "chimeDensity": 1.5,
  "decayTime": 4.0,
  "inharmonicity": 0.05
}
```

### 8. Neural Sonification (Rung 8)

**Sound**: Shifting oscillators  
**Volume**: 0.16  
**Use Case**: Computation

```json
{
  "oscillatorCount": 6,
  "lfoDepth": 50,
  "eventProbability": 0.02
}
```

### 9. Hyperlow Rumble (Rung 9)

**Sound**: Sub-bass + glitch  
**Volume**: 0.20  
**Use Case**: Uncanny otherness

```json
{
  "bassFreqMin": 35,
  "glitchDensity": 0.3,
  "bassGlitchBalance": 0.4
}
```

## Common Configuration Patterns

### Volume Control

```typescript
// Update master gain
module.updateConfig({ masterGain: 0.5 });

// Fade in
module.fadeIn(2.0); // 2 seconds

// Fade out
module.fadeOut(3.0); // 3 seconds
```

### Density/Complexity

```typescript
// Reduce for mobile
module.updateConfig({
  density: 0.15,      // Less frequent events
  complexity: 0.3     // Simpler processing
});

// Reduce for prefers-reduced-motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  module.updateConfig({
    density: 0.1,
    complexity: 0.2
  });
}
```

### Filtering

```typescript
// Tighten frequency range
module.updateConfig({
  lowCutoff: 150,    // Higher highpass
  highCutoff: 600    // Lower lowpass
});
```

## Performance Optimization

### CPU Monitoring

```typescript
// Check performance metrics
const metrics = orchestrator.getPerformanceMetrics();
console.log(`CPU: ${metrics.cpuUsage}%`);
console.log(`Active nodes: ${metrics.activeNodes}`);

// Auto-adjust if performance poor
if (metrics.cpuUsage > 15) {
  orchestrator.reduceQuality();
}
```

### Memory Management

```typescript
// Ensure cleanup
module.destroy(); // Disconnects all nodes

// Verify cleanup
console.assert(module.getState() === 'destroyed');
```

### Mobile Optimization

```typescript
// Detect mobile
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

if (isMobile) {
  // Load reduced configuration
  const mobileConfig = {
    ...config,
    density: config.density * 0.5,
    complexity: config.complexity * 0.5
  };
  module.init(audioContext, mobileConfig);
}
```

## Troubleshooting

### AudioContext Suspended

```typescript
// Resume suspended context
if (audioContext.state === 'suspended') {
  await audioContext.resume();
}
```

### No Sound

```typescript
// Check volume chain
console.log('Master gain:', module.getConfig().masterGain);
console.log('AudioContext state:', audioContext.state);
console.log('Module state:', module.getState());

// Verify output connection
const destination = audioContext.destination;
console.log('Destination channels:', destination.channelCount);
```

### Clicks/Pops

```typescript
// Always use ramps for gain changes
gainNode.gain.setValueAtTime(currentGain, now);
gainNode.gain.linearRampToValueAtTime(targetGain, now + 0.01);

// Never set values directly during playback
// BAD: gainNode.gain.value = newGain;
// GOOD: gainNode.gain.setTargetAtTime(newGain, now, 0.01);
```

### Memory Leaks

```typescript
// Checklist for proper cleanup:
// 1. Stop all oscillators
oscillator.stop();

// 2. Disconnect all nodes
oscillator.disconnect();
gainNode.disconnect();

// 3. Clear references
this.oscillator = null;
this.gainNode = null;

// 4. Cancel scheduled events
clearInterval(this.intervalId);
clearTimeout(this.timeoutId);
```

## Best Practices

### Do's

✅ Initialize AudioContext after user interaction  
✅ Use ramps for all gain changes  
✅ Disconnect nodes in destroy()  
✅ Keep volumes very low (0.1-0.2)  
✅ Test on multiple devices  
✅ Provide easy mute option  
✅ Respect prefers-reduced-motion

### Don'ts

❌ Never start AudioContext without user gesture  
❌ Don't set gain values directly during playback  
❌ Don't forget to disconnect nodes  
❌ Don't make sounds too loud  
❌ Don't create percussive/rhythmic patterns  
❌ Don't assume Web Audio API support  
❌ Don't ignore performance metrics

## Testing Checklist

### Unit Tests

- [ ] Module lifecycle (init, start, stop, destroy)
- [ ] Configuration updates
- [ ] Fade in/out
- [ ] Pause/resume
- [ ] Memory cleanup

### Integration Tests

- [ ] Orchestrator transitions
- [ ] Multiple concurrent modules
- [ ] AudioContext sharing
- [ ] React hook integration

### Audio Quality

- [ ] No clicks or pops
- [ ] Appropriate volume levels
- [ ] Correct frequency range
- [ ] Smooth transitions
- [ ] No distortion

### Performance

- [ ] CPU < 5% (desktop)
- [ ] CPU < 10% (mobile)
- [ ] Memory < 10MB per module
- [ ] No memory leaks
- [ ] Maintains frame rate

### Accessibility

- [ ] Works without audio
- [ ] Easy mute control
- [ ] Volume adjustable
- [ ] Respects prefers-reduced-motion
- [ ] Keyboard accessible

## Configuration Examples

### Quiet Mode (Extra Subtle)

```json
{
  "masterGain": 0.08,
  "density": 0.1,
  "complexity": 0.2
}
```

### Standard Mode (Default)

```json
{
  "masterGain": 0.15,
  "density": 0.3,
  "complexity": 0.4
}
```

### Enhanced Mode (More Present)

```json
{
  "masterGain": 0.25,
  "density": 0.5,
  "complexity": 0.6
}
```

### Mobile Mode (Battery Saving)

```json
{
  "masterGain": 0.12,
  "density": 0.15,
  "complexity": 0.25
}
```

## API Reference

### AudioModule Interface

```typescript
interface AudioModule {
  init(audioContext: AudioContext, config: AudioModuleConfig): void;
  start(): void;
  stop(): void;
  destroy(): void;
  updateConfig(config: Partial<AudioModuleConfig>): void;
  getConfig(): AudioModuleConfig;
  pause(): void;
  resume(): void;
  fadeIn(duration: number): void;
  fadeOut(duration: number): void;
  getState(): ModuleState;
}
```

### AudioModuleOrchestrator

```typescript
class AudioModuleOrchestrator {
  constructor(audioContext: AudioContext, config: AudioConfig);
  
  async loadChapter(chapterId: number): Promise<void>;
  async transitionTo(chapterId: number): Promise<void>;
  
  pause(): void;
  resume(): void;
  destroy(): void;
  
  setGlobalVolume(volume: number): void;
  getPerformanceMetrics(): PerformanceMetrics;
  reduceQuality(): void;
}
```

## Resources

### Documentation

- [AUDIO_MODULES_IMPLEMENTATION_PLAN.md](./AUDIO_MODULES_IMPLEMENTATION_PLAN.md)
- [AUDIO_MODULES_TECHNICAL_SPEC.md](./AUDIO_MODULES_TECHNICAL_SPEC.md)
- [AUDIO_VISUAL_MODULE_MAPPING.md](./AUDIO_VISUAL_MODULE_MAPPING.md)
- [src/audioModules/README.md](./src/audioModules/README.md)

### External Resources

- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Audio API Spec](https://www.w3.org/TR/webaudio/)
- [AudioWorklet Examples](https://googlechromelabs.github.io/web-audio-samples/audio-worklet/)

---

**Last Updated**: 2025-12-03  
**For**: Unsung Heroes Interactive Reader  
**Developers**: Quick reference for implementing and debugging audio modules
