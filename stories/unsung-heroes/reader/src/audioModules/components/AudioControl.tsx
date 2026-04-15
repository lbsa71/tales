/**
 * Audio Control Component
 * 
 * Simple, non-intrusive audio controls for the reader.
 * Provides mute/unmute and volume control.
 */

import React, { useState } from 'react';
import type { AudioModuleOrchestrator } from '../AudioModuleOrchestrator';
import { useIOSAudioUnlock } from '../hooks/useIOSAudioUnlock';

interface AudioControlProps {
  orchestrator: AudioModuleOrchestrator | null;
  audioContextRef: React.RefObject<AudioContext | null>;
  isReady: boolean;
  isPlaying: boolean;
  onInit: () => void;
  onPause: () => void;
  onResume: () => void;
  className?: string;
}

export const AudioControl: React.FC<AudioControlProps> = ({
  orchestrator,
  audioContextRef,
  isReady,
  isPlaying,
  onInit,
  onPause,
  onResume,
  className = '',
}) => {
  const [volume, setVolume] = useState(50);
  const [showControls, setShowControls] = useState(false);
  
  // iOS audio unlock hook - ensures AudioContext is unlocked on first user interaction
  const unlockAudio = useIOSAudioUnlock(audioContextRef);
  
  // Derive mute state from isPlaying instead of storing it
  const isMuted = !isPlaying;

  /**
   * Handle volume change
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);

    // Update the current module's volume directly
    if (orchestrator) {
      const volumeValue = newVolume / 100; // Convert 0-100 to 0.0-1.0
      orchestrator.setVolume(volumeValue);
    }
  };

  /**
   * Toggle mute
   * iOS audio unlock MUST be called synchronously in the user gesture handler
   */
  const handleMuteToggle = () => {
    console.log('[AudioControl] handleMuteToggle() called', {
      isPlaying,
      isReady,
      hasOrchestrator: !!orchestrator,
      audioContextState: audioContextRef.current?.state,
      timestamp: new Date().toISOString(),
    });

    // CRITICAL: Unlock audio FIRST, synchronously in the same tick as user gesture
    // This is required for iOS to allow AudioContext.resume() to work
    unlockAudio();
    
    // Then proceed with normal mute/unmute logic
    if (isPlaying) {
      console.log('[AudioControl] Pausing audio...');
      onPause();
    } else if (isReady) {
      console.log('[AudioControl] Resuming audio...');
      onResume();
    } else {
      // First time - initialize
      console.log('[AudioControl] Initializing audio for first time...');
      onInit();
    }
  };

  /**
   * Handle enabling audio for the first time
   * iOS audio unlock MUST be called synchronously in the user gesture handler
   */
  const handleEnableAudio = () => {
    console.log('[AudioControl] handleEnableAudio() called', {
      isReady,
      hasOrchestrator: !!orchestrator,
      audioContextState: audioContextRef.current?.state,
      timestamp: new Date().toISOString(),
    });

    // CRITICAL: Unlock audio FIRST, synchronously in the same tick as user gesture
    unlockAudio();
    console.log('[AudioControl] Calling onInit()...');
    onInit();
  };

  return (
    <div className={`audio-control ${className}`}>
      <button
        onClick={() => setShowControls(!showControls)}
        className="audio-control-toggle"
        aria-label="Audio controls"
        title={showControls ? 'Hide audio controls' : 'Show audio controls'}
      >
        🔊
      </button>

      {showControls && (
        <div className="audio-control-panel">
          <button
            onClick={handleMuteToggle}
            className="audio-mute-button"
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          <label className="audio-volume-label">
            <span className="audio-volume-text">Volume</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="audio-volume-slider"
              aria-label="Volume"
              disabled={!isReady}
            />
            <span className="audio-volume-value">{volume}%</span>
          </label>

          {!isReady && (
            <button
              onClick={handleEnableAudio}
              className="audio-init-button"
              aria-label="Enable audio"
            >
              Enable Audio
            </button>
          )}
        </div>
      )}
    </div>
  );
};
