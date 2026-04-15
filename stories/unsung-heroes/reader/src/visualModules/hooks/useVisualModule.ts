/**
 * useVisualModule Hook
 * 
 * React hook for managing visual module lifecycle.
 * Handles initialization, chapter transitions, and cleanup.
 */

import { useEffect, useRef, useState } from 'react';
import { VisualModuleOrchestrator } from '../VisualModuleOrchestrator';
import type { VisualConfig } from '../VisualModuleTypes';
import visualConfigData from '../config/visualConfig.json';

const visualConfig = visualConfigData as VisualConfig;

interface UseVisualModuleOptions {
  chapterId: number;
  enabled?: boolean;
}

export const useVisualModule = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UseVisualModuleOptions
) => {
  const { chapterId, enabled = true } = options;
  const orchestratorRef = useRef<VisualModuleOrchestrator | null>(null);
  const [isReady, setIsReady] = useState(false);
  const previousChapterIdRef = useRef<number | null>(null);

  // Initialize orchestrator
  useEffect(() => {
    if (!enabled || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    
    // Create orchestrator
    const orchestrator = new VisualModuleOrchestrator(canvas, visualConfig);
    orchestratorRef.current = orchestrator;

    // Load initial chapter
    orchestrator.loadChapter(chapterId);
    previousChapterIdRef.current = chapterId;

    // Set ready state after initialization
    const readyTimer = setTimeout(() => setIsReady(true), 0);

    // Cleanup on unmount
    return () => {
      clearTimeout(readyTimer);
      if (orchestratorRef.current) {
        orchestratorRef.current.destroy();
        orchestratorRef.current = null;
      }
      setIsReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, enabled]);

  // Handle chapter changes
  useEffect(() => {
    if (!isReady || !orchestratorRef.current || !enabled) {
      return;
    }

    // Only transition if chapter actually changed
    if (previousChapterIdRef.current !== chapterId) {
      orchestratorRef.current.transitionTo(chapterId);
      previousChapterIdRef.current = chapterId;
    }
  }, [chapterId, isReady, enabled]);

  // Handle reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (orchestratorRef.current) {
        if (e.matches) {
          // User prefers reduced motion - pause modules
          orchestratorRef.current.pause();
        } else {
          // Resume modules
          orchestratorRef.current.resume();
        }
      }
    };

    // Check initial state
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [isReady, chapterId]);

  return {
    isReady,
    orchestrator: orchestratorRef.current,
  };
};
