# Audio Modules - Rung 1 Implementation Test

This document provides instructions for testing the FilteredNoiseModule (Rung 1) implementation.

## What Was Implemented

### Phase 1: Foundation (Complete)
- ✅ **BaseAudioModule** - Abstract base class with:
  - AudioContext management
  - Gain control and volume
  - High-pass and low-pass filtering
  - Stereo panning
  - Fade in/out functionality
  - Lifecycle management (init, start, stop, destroy)
  - Performance metrics tracking

- ✅ **AudioModuleOrchestrator** - Manages module lifecycle:
  - Module loading and unloading
  - Smooth crossfading between chapters
  - Configuration management
  - AudioContext initialization and resumption

- ✅ **React Integration**:
  - `useAudioModule` hook for lifecycle management
  - `AudioControl` component for user controls (mute, volume)

### Phase 2: FilteredNoiseModule (Rung 1) - Complete
- ✅ **Pink noise generation** using Paul Kellet's algorithm
- ✅ **Slow filter modulation** with LFO (0.02 Hz default)
- ✅ **Ultra-rare soft grains** (one every 15-45 seconds)
- ✅ **Proper audio routing** through bandpass filter

## Testing Instructions

### 1. Basic API Test

```typescript
import { AudioModuleOrchestrator, FilteredNoiseModule } from './audioModules';
import audioConfig from './audioModules/config/audioConfig.json';

// Initialize AudioContext (must be after user interaction)
const audioContext = new AudioContext();

// Test 1: Direct Module Usage
const module = new FilteredNoiseModule();
const config = audioConfig.modules[0].config; // Rung 1 config

module.init(audioContext, config);
module.start();
module.fadeIn(2.0); // Fade in over 2 seconds

// Listen for at least 30 seconds to hear grains (they're very sparse)
setTimeout(() => {
  module.fadeOut(2.0);
  setTimeout(() => {
    module.stop();
    module.destroy();
  }, 2000);
}, 30000);

// Test 2: Orchestrator Usage
const orchestrator = new AudioModuleOrchestrator(audioContext, audioConfig);
await orchestrator.loadChapter(1); // Load Rung 1
// Listen...
await orchestrator.transitionTo(2); // Transition to next rung (when implemented)
```

### 2. React Hook Test

```tsx
import { useAudioModule, AudioControl } from './audioModules';
import audioConfig from './audioModules/config/audioConfig.json';

function TestComponent() {
  const {
    orchestrator,
    isReady,
    isPlaying,
    error,
    initAudio,
    pause,
    resume,
    stop,
  } = useAudioModule({
    config: audioConfig,
    enabled: true,
    currentChapter: 1,
  });

  return (
    <div>
      <AudioControl
        orchestrator={orchestrator}
        isReady={isReady}
        isPlaying={isPlaying}
        onInit={initAudio}
        onPause={pause}
        onResume={resume}
      />
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### 3. Expected Audio Output

**FilteredNoiseModule (Rung 1: Pre-cellular replicators)**

Listen for:
- 🔊 **Continuous pink noise** - Very quiet, cosmic hum
- 🎛️ **Slow filter modulation** - Filter frequency drifts slowly (20-second cycles)
- ✨ **Ultra-rare grains** - Soft sine wave "pings" every 15-45 seconds
- 🎵 **Frequency range** - 100 Hz - 600 Hz (muffled, warm)

**Character**: Should feel like a distant, diffuse cosmic background. Pre-semantic, formless, primordial.

### 4. Configuration Test

Test different configurations in `audioConfig.json`:

```json
{
  "masterGain": 0.15,           // Overall volume (0.0 - 1.0)
  "noiseType": "pink",          // "pink" or "brown"
  "filterModulationRate": 0.02, // LFO speed (Hz)
  "filterModulationDepth": 40,  // LFO depth (Hz)
  "grainDensity": 0.001,        // Probability of grain trigger
  "grainPitchMin": 150,         // Min grain frequency (Hz)
  "grainPitchMax": 250          // Max grain frequency (Hz)
}
```

Try:
- Increasing `grainDensity` to 0.01 for more frequent grains
- Changing `noiseType` to "brown" for darker tone
- Adjusting `filterModulationRate` to 0.05 for faster drift

### 5. Performance Test

Monitor performance in Chrome DevTools:

```javascript
// Get metrics
const metrics = orchestrator.getMetrics();
console.log('Active nodes:', metrics.activeNodes);
console.log('Last update:', metrics.lastUpdateTime);

// Check CPU usage
// Should be < 5% on desktop, < 10% on mobile
```

### 6. Memory Leak Test

```javascript
// Repeatedly load and destroy module
for (let i = 0; i < 10; i++) {
  await orchestrator.loadChapter(1);
  await new Promise(resolve => setTimeout(resolve, 2000));
  orchestrator.stop();
  await new Promise(resolve => setTimeout(resolve, 500));
}

// Check memory in Chrome DevTools Performance tab
// Memory should return to baseline after each destroy()
```

## Known Limitations

1. **Browser Autoplay Policy**: AudioContext must be initialized after user interaction
2. **No Visual Feedback**: This test doesn't include visual indicators
3. **Single Module**: Only Rung 1 implemented so far
4. **No Tests**: Unit tests not yet implemented

## Next Steps

- Implement Rung 2: GranularCloudModule
- Implement Rung 3: SparseFMModule
- Add visual feedback for audio state
- Integrate with Reader component
- Add unit tests
- Add performance monitoring

## Troubleshooting

### No Audio
- Check if AudioContext is suspended (call `audioContext.resume()`)
- Ensure user has interacted with page first
- Check browser console for errors
- Verify audio output device is working

### Audio Too Quiet
- Increase `masterGain` in config
- Check system volume
- Use headphones for better low-frequency response

### Grains Not Audible
- Wait at least 30 seconds (they're very sparse)
- Increase `grainDensity` temporarily for testing
- Increase `grainGain` in config

### Performance Issues
- Check CPU usage in DevTools
- Reduce `grainDensity`
- Ensure proper cleanup (call `destroy()`)

## Success Criteria

✅ Build completes without errors
✅ ESLint passes with no warnings
✅ Module initializes without errors
✅ Pink noise is audible
✅ Filter modulation is working (subtle drift)
✅ Grains trigger occasionally
✅ Fade in/out works smoothly
✅ Destroy() cleans up properly
✅ No memory leaks over extended use

---

**Status**: ✅ Phase 1 and Rung 1 Complete
**Next**: Implement additional rungs or integrate with Reader
