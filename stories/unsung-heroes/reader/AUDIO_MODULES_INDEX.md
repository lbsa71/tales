# Audio Modules Documentation Index

## Overview

This directory contains comprehensive planning and documentation for the **Audio Modules** system in the Unsung Heroes interactive reader. The audio modules complement the existing visual modules to create a complete multi-sensory experience that enhances the philosophical depth and emotional impact of the story.

## Documentation Structure

### 📚 Planning Documents (Start Here)

1. **[AUDIO_MODULES_SUMMARY.md](./AUDIO_MODULES_SUMMARY.md)** - Executive summary
   - Quick overview of the complete plan
   - Module mapping to visual modules
   - Implementation checklist and status
   - **Read this first** for a high-level understanding

2. **[AUDIO_MODULES_IMPLEMENTATION_PLAN.md](./AUDIO_MODULES_IMPLEMENTATION_PLAN.md)** - Detailed implementation strategy
   - Architecture and design principles
   - 6-week implementation timeline
   - Integration with visual modules
   - Risk mitigation and success criteria
   - **Read this** before starting implementation

3. **[AUDIO_MODULES_TECHNICAL_SPEC.md](./AUDIO_MODULES_TECHNICAL_SPEC.md)** - Technical specifications
   - Detailed algorithm descriptions for all 9 modules
   - Configuration parameters and defaults
   - Web Audio API implementation details
   - Code examples and testing procedures
   - **Use this** as reference during implementation

### 🗺️ Reference Documents

4. **[AUDIO_VISUAL_MODULE_MAPPING.md](./AUDIO_VISUAL_MODULE_MAPPING.md)** - Module alignment guide
   - Complete mapping between audio and visual modules
   - Detailed breakdown for each of the 9 rungs
   - Combined experience design principles
   - User control strategy
   - **Use this** to understand how modules work together

5. **[AUDIO_MODULES_QUICK_REFERENCE.md](./AUDIO_MODULES_QUICK_REFERENCE.md)** - Developer quick reference
   - Quick start code examples
   - Common configuration patterns
   - Performance optimization tips
   - Troubleshooting guide
   - API reference
   - **Use this** during development for quick lookups

### 💻 Code Documentation

6. **[src/audioModules/README.md](./src/audioModules/README.md)** - Module system documentation
   - Directory structure
   - Design principles
   - Quick start guide
   - Module reference
   - Development guidelines
   - **Read this** for hands-on implementation

## Quick Navigation

### I want to...

**...understand the overall plan**
→ Start with [AUDIO_MODULES_SUMMARY.md](./AUDIO_MODULES_SUMMARY.md)

**...start implementing**
→ Read [AUDIO_MODULES_IMPLEMENTATION_PLAN.md](./AUDIO_MODULES_IMPLEMENTATION_PLAN.md) and [src/audioModules/README.md](./src/audioModules/README.md)

**...implement a specific module**
→ Reference [AUDIO_MODULES_TECHNICAL_SPEC.md](./AUDIO_MODULES_TECHNICAL_SPEC.md)

**...understand audio/visual integration**
→ Read [AUDIO_VISUAL_MODULE_MAPPING.md](./AUDIO_VISUAL_MODULE_MAPPING.md)

**...debug or troubleshoot**
→ Use [AUDIO_MODULES_QUICK_REFERENCE.md](./AUDIO_MODULES_QUICK_REFERENCE.md)

**...see code examples**
→ Check [src/audioModules/README.md](./src/audioModules/README.md) and [AUDIO_MODULES_QUICK_REFERENCE.md](./AUDIO_MODULES_QUICK_REFERENCE.md)

## The 9 Audio Modules

Each module corresponds to one evolutionary rung (chapter):

| Rung | Module | Sound Type | Character |
|------|--------|------------|-----------|
| 1 | FilteredNoise | Pink noise + grains | Cosmic hum |
| 2 | GranularCloud | Granular textures | Soft murmuring |
| 3 | SparseFM | FM bleeps | Glints of order |
| 4 | Microsound | Digital crackles | Tiny errors |
| 5 | AdditiveDrone | Harmonic drone | Meditative presence |
| 6 | StereoShift | Panning pads | Smooth movement |
| 7 | SyntheticChimes | Gentle bells | Thought clusters |
| 8 | NeuralSonification | Shifting oscillators | Computational |
| 9 | HyperlowRumble | Sub-bass + glitch | Uncanny otherness |

## Design Principles

All audio modules follow these core principles:

1. **Ambient-First** - Background textures, never foreground music
2. **Non-Rhythmic** - No beats or patterns to lock onto
3. **Sparse** - Long intervals between events
4. **Quiet** - Default gain at -26 to -18 dB
5. **Subtle** - No sharp attacks or percussive sounds
6. **Complementary** - Works with visual modules, not against them

## Key Features

✅ **9 Unique Modules** - One per evolutionary rung  
✅ **Web Audio API** - Pure browser implementation  
✅ **High Performance** - <5% CPU, <10MB memory per module  
✅ **Accessible** - Respects prefers-reduced-motion, easy controls  
✅ **Non-Distracting** - Enhances atmosphere without competing with text  
✅ **Well Documented** - Complete specs and implementation guides

## Implementation Status

**Current Phase**: Planning Complete ✅

### Completed
- [x] Architecture design
- [x] Module specifications
- [x] Configuration structure
- [x] TypeScript type definitions
- [x] Directory structure
- [x] Documentation (5 comprehensive documents)

### Next Steps
- [ ] Implement BaseAudioModule (Phase 1)
- [ ] Implement AudioModuleOrchestrator (Phase 1)
- [ ] Create React components/hooks (Phase 1)
- [ ] Implement first 3 modules (Phase 2)
- [ ] Implement remaining 6 modules (Phase 3-4)
- [ ] Integration with Reader (Phase 5)
- [ ] Testing and polish (Phase 6)

**Estimated Timeline**: 6 weeks

## Technology Stack

- **Web Audio API** - All audio synthesis and processing
- **TypeScript** - Type-safe module implementation
- **React** - UI components and lifecycle management
- **JSON** - Configuration and parameter storage
- **No External Libraries** - Pure browser implementation

## File Structure

```
reader/
├── AUDIO_MODULES_SUMMARY.md                    # Executive summary
├── AUDIO_MODULES_IMPLEMENTATION_PLAN.md        # Implementation strategy
├── AUDIO_MODULES_TECHNICAL_SPEC.md             # Technical specifications
├── AUDIO_VISUAL_MODULE_MAPPING.md              # Audio/visual alignment
├── AUDIO_MODULES_QUICK_REFERENCE.md            # Developer quick reference
├── AUDIO_MODULES_INDEX.md                      # This file
└── src/
    └── audioModules/
        ├── README.md                           # Module system docs
        ├── index.ts                            # Exports
        ├── AudioModuleTypes.ts                 # Type definitions
        ├── BaseAudioModule.ts                  # Base class (planned)
        ├── AudioModuleOrchestrator.ts          # Lifecycle manager (planned)
        ├── config/
        │   └── audioConfig.json                # Module configurations
        ├── modules/
        │   └── (9 module implementations - planned)
        ├── components/
        │   └── AudioControl.tsx                # React component (planned)
        └── hooks/
            └── useAudioModule.ts               # React hook (planned)
```

## Related Documentation

### Visual Modules
- [VISUAL_MODULES_SUMMARY.md](./VISUAL_MODULES_SUMMARY.md)
- [VISUAL_MODULES_IMPLEMENTATION_PLAN.md](./VISUAL_MODULES_IMPLEMENTATION_PLAN.md)
- [VISUAL_MODULES_TECHNICAL_SPEC.md](./VISUAL_MODULES_TECHNICAL_SPEC.md)
- [src/visualModules/README.md](./src/visualModules/README.md)

### Project Documentation
- [README.md](../README.md) - Main project README
- [CONCEPTUAL_MAP.md](../CONCEPTUAL_MAP.md) - Story structure
- [IMPLEMENTATION_STRATEGY.md](../IMPLEMENTATION_STRATEGY.md) - Writing workflow

## Contributing

### Before You Start
1. Read [AUDIO_MODULES_SUMMARY.md](./AUDIO_MODULES_SUMMARY.md)
2. Review [AUDIO_MODULES_IMPLEMENTATION_PLAN.md](./AUDIO_MODULES_IMPLEMENTATION_PLAN.md)
3. Check [src/audioModules/README.md](./src/audioModules/README.md)

### During Development
- Follow TypeScript interfaces in AudioModuleTypes.ts
- Use configuration from audioConfig.json
- Reference [AUDIO_MODULES_TECHNICAL_SPEC.md](./AUDIO_MODULES_TECHNICAL_SPEC.md)
- Test with [AUDIO_MODULES_QUICK_REFERENCE.md](./AUDIO_MODULES_QUICK_REFERENCE.md)

### Testing
- Unit tests for lifecycle methods
- Integration tests with orchestrator
- Audio quality testing (manual)
- Performance profiling
- Cross-browser testing

## Support

### Documentation Issues
- Check this index for correct document
- Review table of contents in each document
- Use quick navigation guide above

### Technical Questions
- Refer to [AUDIO_MODULES_TECHNICAL_SPEC.md](./AUDIO_MODULES_TECHNICAL_SPEC.md)
- Check [AUDIO_MODULES_QUICK_REFERENCE.md](./AUDIO_MODULES_QUICK_REFERENCE.md)
- Review code examples in [src/audioModules/README.md](./src/audioModules/README.md)

### Implementation Help
- Follow [AUDIO_MODULES_IMPLEMENTATION_PLAN.md](./AUDIO_MODULES_IMPLEMENTATION_PLAN.md)
- Reference existing visual modules for patterns
- Check Web Audio API documentation (MDN)

## External Resources

### Web Audio API
- [MDN Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [W3C Web Audio API Spec](https://www.w3.org/TR/webaudio/)
- [Web Audio API Examples](https://googlechromelabs.github.io/web-audio-samples/)

### Sound Design
- Ambient music theory (Brian Eno)
- Generative music systems
- Non-intrusive interface sounds

### Algorithms
- Pink noise generation
- Granular synthesis
- FM synthesis
- Microsound composition

## Version History

- **1.0** (2025-12-03) - Initial planning documentation complete
  - 5 comprehensive planning documents
  - Complete TypeScript type definitions
  - Configuration for all 9 modules
  - Directory structure established

## License

Part of the "Unsung Heroes" creative writing project by lbsa71.

---

**Last Updated**: 2025-12-03  
**Status**: Planning Complete - Ready for Implementation  
**Next Milestone**: Phase 1 - Foundation (BaseAudioModule, Orchestrator, React integration)
