/**
 * iOS Audio Unlock Hook
 * 
 * Provides a function to unlock audio playback on iOS devices.
 * 
 * iOS (all browsers) enforces strict autoplay rules:
 * 1. Audio context MUST be created or resumed inside a direct user gesture event
 * 2. If AudioContext is created before user interaction, iOS marks it as "suspended"
 * 3. Later .resume() calls outside event handlers are ignored
 * 
 * This hook ensures that the AudioContext is properly unlocked by calling
 * resume() synchronously within the user's gesture event handler.
 * 
 * Usage:
 * ```tsx
 * const unlockAudio = useIOSAudioUnlock(audioContextRef);
 * 
 * <button onClick={() => {
 *   unlockAudio(); // REQUIRED for iOS - must be called synchronously
 *   toggleMute();  // your existing logic
 * }}>
 *   {muted ? "Unmute" : "Mute"}
 * </button>
 * ```
 */

import { useCallback } from 'react';

export function useIOSAudioUnlock(audioContextRef: React.RefObject<AudioContext | null>) {
  const unlock = useCallback(() => {
    const audioContext = audioContextRef.current;
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent);
    
    console.log('[iOS Audio Unlock] unlockAudio() called', {
      hasAudioContext: !!audioContext,
      userAgent: userAgent,
      isIOS: isIOS,
      isChrome: isChrome,
      timestamp: new Date().toISOString(),
    });

    let ctx = audioContext;

    // If the AudioContext hasn't been created yet, create it synchronously
    // in this user gesture handler. This is necessary on iOS where creating
    // the context outside a gesture leaves it "suspended".
    if (!ctx) {
      try {
        ctx = new AudioContext();
        audioContextRef.current = ctx;
        console.log('[iOS Audio Unlock] Created new AudioContext inside unlockAudio()', {
          state: ctx.state,
          sampleRate: ctx.sampleRate,
        });
      } catch (err) {
        console.error('[iOS Audio Unlock] ❌ Failed to create AudioContext:', err);
        return;
      }
    }

    const previousState = ctx.state;
    console.log('[iOS Audio Unlock] AudioContext state before resume:', {
      state: previousState,
      sampleRate: ctx.sampleRate,
      destination: ctx.destination,
    });

    // Resume AudioContext if suspended or interrupted (iOS-specific state)
    // This MUST happen synchronously in the user gesture handler
    if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
      console.log('[iOS Audio Unlock] Attempting to resume AudioContext...');
      ctx.resume()
        .then(() => {
          console.log('[iOS Audio Unlock] ✅ AudioContext resumed successfully', {
            previousState: previousState,
            newState: ctx.state,
            sampleRate: ctx.sampleRate,
          });
        })
        .catch((err) => {
          console.error('[iOS Audio Unlock] ❌ Failed to resume AudioContext:', {
            error: err,
            errorMessage: err instanceof Error ? err.message : String(err),
            errorStack: err instanceof Error ? err.stack : undefined,
            state: ctx.state,
          });
        });
    } else {
      console.log(`[iOS Audio Unlock] AudioContext already in state: ${ctx.state}`, {
        state: ctx.state,
        sampleRate: ctx.sampleRate,
      });
    }
  }, [audioContextRef]);

  return unlock;
}
