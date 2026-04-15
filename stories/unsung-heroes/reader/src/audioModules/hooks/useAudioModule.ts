/**
 * useAudioModule Hook
 * 
 * React hook for managing audio module lifecycle in the reader.
 * Handles AudioContext initialization, module loading, and cleanup.
 * 
 * iOS Compatibility:
 * - Implements global event listeners to resume AudioContext on user gestures
 * - Required because iOS can suspend AudioContext even after initial resume
 * - Handles both 'suspended' and 'interrupted' states (iOS-specific)
 * - See AUDIO_MODULES_TECHNICAL_SPEC.md for detailed iOS handling documentation
 */

import { useEffect, useRef, useState } from 'react';
import { AudioModuleOrchestrator } from '../AudioModuleOrchestrator';
import type { AudioConfig } from '../AudioModuleTypes';

interface UseAudioModuleOptions {
  config: AudioConfig;
  enabled?: boolean;
  currentChapter?: number;
}

interface UseAudioModuleReturn {
  orchestrator: AudioModuleOrchestrator | null;
  audioContextRef: React.RefObject<AudioContext | null>;
  isReady: boolean;
  isPlaying: boolean;
  error: string | null;
  initAudio: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function useAudioModule({
  config,
  enabled = true,
  currentChapter = 1,
}: UseAudioModuleOptions): UseAudioModuleReturn {
  const orchestratorRef = useRef<AudioModuleOrchestrator | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [orchestrator, setOrchestrator] = useState<AudioModuleOrchestrator | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);

  /**
   * Initialize AudioContext and orchestrator
   */
  const initAudio = async (): Promise<void> => {
    console.log('[useAudioModule] initAudio() called', {
      hasInitialized: hasInitializedRef.current,
      enabled,
      hasAudioContext: !!audioContextRef.current,
      audioContextState: audioContextRef.current?.state,
      timestamp: new Date().toISOString(),
    });

    if (hasInitializedRef.current || !enabled) {
      console.log('[useAudioModule] initAudio() skipped - already initialized or disabled');
      return;
    }

    try {
      // Create AudioContext (must be after user interaction)
      if (!audioContextRef.current) {
        console.log('[useAudioModule] Creating new AudioContext...');
        audioContextRef.current = new AudioContext();
        console.log('[useAudioModule] AudioContext created', {
          state: audioContextRef.current.state,
          sampleRate: audioContextRef.current.sampleRate,
        });
      } else {
        console.log('[useAudioModule] Using existing AudioContext', {
          state: audioContextRef.current.state,
          sampleRate: audioContextRef.current.sampleRate,
        });
      }

      // Resume if suspended or interrupted (browser autoplay policy, especially iOS)
      if (audioContextRef.current.state === 'suspended' || audioContextRef.current.state === 'interrupted') {
        console.log('[useAudioModule] AudioContext is suspended/interrupted, resuming...', {
          state: audioContextRef.current.state,
        });
        await audioContextRef.current.resume();
        console.log('[useAudioModule] AudioContext resumed', {
          newState: audioContextRef.current.state,
        });
      }

      // Create orchestrator
      if (!orchestratorRef.current) {
        console.log('[useAudioModule] Creating AudioModuleOrchestrator...');
        orchestratorRef.current = new AudioModuleOrchestrator(
          audioContextRef.current,
          config
        );
        setOrchestrator(orchestratorRef.current);
        console.log('[useAudioModule] AudioModuleOrchestrator created');
      }

      hasInitializedRef.current = true;
      setIsReady(true);
      setError(null);
      console.log('[useAudioModule] ✅ AudioContext initialized and ready', {
        state: audioContextRef.current.state,
        sampleRate: audioContextRef.current.sampleRate,
      });
    } catch (err) {
      console.error('[useAudioModule] ❌ Failed to initialize audio:', {
        error: err,
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
      });
      setError(err instanceof Error ? err.message : 'Failed to initialize audio');
      setIsReady(false);
    }
  };

  /**
   * Load chapter when ready and chapter changes
   * Use transitionTo for smooth crossfading if there's already a chapter playing
   */
  useEffect(() => {
    if (isReady && orchestratorRef.current && enabled) {
      const orchestrator = orchestratorRef.current;
      const currentChapterId = orchestrator.getCurrentChapterId();
      
      // Resume AudioContext before loading/transitioning (critical for iOS)
      orchestrator.resumeAudioContext().then(() => {
        console.log('[useAudioModule] AudioContext resumed before load/transition', {
          targetChapter: currentChapter,
          currentChapterId,
          audioContextState: audioContextRef.current?.state,
        });
        // Use transitionTo for smooth crossfading if there's already a chapter playing
        if (currentChapterId !== -1 && currentChapterId !== currentChapter) {
          console.log(`[Audio] Transitioning from chapter ${currentChapterId} to ${currentChapter}`);
          orchestrator.transitionTo(currentChapter)
            .then(() => {
              setIsPlaying(true);
              console.log(`[Audio] Successfully transitioned to chapter ${currentChapter}`);
            })
            .catch((err) => {
              console.error('Failed to transition chapter audio:', err);
              setError(err instanceof Error ? err.message : 'Failed to transition chapter');
            });
        } else if (currentChapterId !== currentChapter) {
          // First load or no previous chapter
          console.log(`[Audio] Loading chapter ${currentChapter}`);
          orchestrator.loadChapter(currentChapter)
            .then(() => {
              setIsPlaying(true);
              console.log(`[Audio] Successfully loaded chapter ${currentChapter}`);
            })
            .catch((err) => {
              console.error('Failed to load chapter audio:', err);
              setError(err instanceof Error ? err.message : 'Failed to load chapter');
            });
        }
      }).catch((err) => {
        console.error('Failed to resume AudioContext:', err);
        setError(err instanceof Error ? err.message : 'Failed to resume AudioContext');
      });
    }
  }, [isReady, currentChapter, enabled]);

  /**
   * Pause audio playback
   */
  const pause = (): void => {
    if (orchestratorRef.current) {
      orchestratorRef.current.pause();
      setIsPlaying(false);
    }
  };

  /**
   * Resume audio playback
   */
  const resume = (): void => {
    const orchestrator = orchestratorRef.current;
    if (orchestrator) {
      // Resume AudioContext first (critical for iOS)
      orchestrator.resumeAudioContext().then(() => {
        orchestrator.resume();
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Failed to resume AudioContext:', err);
        setError(err instanceof Error ? err.message : 'Failed to resume AudioContext');
      });
    }
  };

  /**
   * Stop audio playback
   */
  const stop = (): void => {
    if (orchestratorRef.current) {
      orchestratorRef.current.stop();
      setIsPlaying(false);
    }
  };

  /**
   * Set up iOS-specific event listeners to resume AudioContext on user interaction
   * iOS can suspend the AudioContext even after initial resume, so we need to
   * listen for user gestures and resume the context whenever it gets suspended
   */
  useEffect(() => {
    if (!audioContextRef.current || !enabled) {
      return;
    }

    const audioContext = audioContextRef.current;

    /**
     * Resume AudioContext if suspended/interrupted (iOS requirement)
     * This must be called in direct response to user gestures
     */
    const resumeOnUserGesture = () => {
      if (audioContext.state === 'suspended' || audioContext.state === 'interrupted') {
        audioContext.resume().then(() => {
          console.log('[Audio] AudioContext resumed after user gesture');
        }).catch((err) => {
          console.warn('[Audio] Failed to resume AudioContext:', err);
        });
      }
    };

    // Listen for various user interaction events
    // These must fire in response to actual user actions for iOS to allow resume
    // Touch events use passive: true for better scroll performance
    const touchEvents = ['touchstart', 'touchend'];
    const otherEvents = ['mousedown', 'click', 'keydown'];
    
    touchEvents.forEach(event => {
      document.addEventListener(event, resumeOnUserGesture, { passive: true });
    });
    
    otherEvents.forEach(event => {
      document.addEventListener(event, resumeOnUserGesture);
    });

    // Cleanup event listeners
    return () => {
      touchEvents.forEach(event => {
        document.removeEventListener(event, resumeOnUserGesture);
      });
      otherEvents.forEach(event => {
        document.removeEventListener(event, resumeOnUserGesture);
      });
    };
  }, [enabled]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (orchestratorRef.current) {
        orchestratorRef.current.destroy();
        orchestratorRef.current = null;
      }
      if (audioContextRef.current) {
        // Close AudioContext and handle potential rejection
        audioContextRef.current.close().catch((err) => {
          console.warn('Failed to close AudioContext:', err);
        });
        audioContextRef.current = null;
      }
      hasInitializedRef.current = false;
    };
  }, []);

  return {
    orchestrator,
    audioContextRef,
    isReady,
    isPlaying,
    error,
    initAudio,
    pause,
    resume,
    stop,
  };
}
