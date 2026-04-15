import { useState, useRef, useEffect } from 'react';
import { chapters, getTotalChapters } from './chaptersData';
import { useVisualModule, visualConfig } from './visualModules';
import { useAudioModule, AudioControl, audioConfig } from './audioModules';
import { Timeline } from './components/Timeline';
import './Reader.css';

const Reader = () => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeState, setFadeState] = useState<'visible' | 'fading' | 'hidden'>('visible');
  const [previousChapters, setPreviousChapters] = useState<number[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const visualCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize visual module
  const { orchestrator: visualOrchestrator } = useVisualModule(visualCanvasRef, {
    chapterId: currentChapterIndex + 1, // Chapters are 1-indexed in config
    enabled: true,
  });

  // Initialize audio module
  const {
    orchestrator,
    audioContextRef,
    isReady: isAudioReady,
    isPlaying: isAudioPlaying,
    error: audioError,
    initAudio,
    pause: pauseAudio,
    resume: resumeAudio,
  } = useAudioModule({
    config: audioConfig,
    enabled: audioConfig.global.enableAudio,
    currentChapter: currentChapterIndex + 1, // Chapters are 1-indexed in config
  });

  // Log audio errors for debugging
  useEffect(() => {
    if (audioError) {
      console.error('Audio error:', audioError);
    }
  }, [audioError]);

  // Forward tap events from content-container directly to visual module
  // This allows the visual module to react to clicks on the text area
  useEffect(() => {
    const container = contentRef.current;
    if (!container || !visualOrchestrator) return;

    let pointerDownTime = 0;
    let pointerDownY = 0;
    let pointerDownX = 0;
    const TAP_MAX_DISTANCE = 10; // pixels
    const TAP_MAX_TIME = 500; // milliseconds

    const handlePointerDown = (e: PointerEvent) => {
      // Only handle primary pointer
      if (!e.isPrimary) return;
      
      pointerDownTime = Date.now();
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
    };

    const handlePointerUp = (e: PointerEvent) => {
      // Only handle primary pointer
      if (!e.isPrimary) return;

      const dt = Date.now() - pointerDownTime;
      const dx = e.clientX - pointerDownX;
      const dy = e.clientY - pointerDownY;
      const distSq = dx * dx + dy * dy;

      // Check if it's a tap (not a scroll/drag)
      if (dt <= TAP_MAX_TIME && distSq <= TAP_MAX_DISTANCE * TAP_MAX_DISTANCE) {
        // It's a tap - forward directly to visual module
        const rect = container.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          console.log('[content-container] Forwarding tap to visual module:', {
            clientX: e.clientX,
            clientY: e.clientY,
          });

          // Get current module and call handleInteraction directly
          const currentModule = visualOrchestrator.getCurrentModule();
          if (currentModule && 'handleInteraction' in currentModule && typeof currentModule.handleInteraction === 'function') {
            (currentModule as any).handleInteraction(e.clientX, e.clientY, 'tap');
            console.log('[content-container] Visual module interaction triggered');
          } else {
            console.warn('[content-container] Current module does not support handleInteraction');
          }
        }
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointerup', handlePointerUp);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointerup', handlePointerUp);
    };
  }, [visualOrchestrator]);

  // Connect visual module events to audio module
  useEffect(() => {
    if (visualOrchestrator && orchestrator) {
      // Set up event forwarding from visual to audio
      visualOrchestrator.setEventListener((event) => {
        orchestrator.handleVisualEvent(event);
      });
    }
  }, [visualOrchestrator, orchestrator]);

  const totalChapters = getTotalChapters();
  const currentChapter = chapters[currentChapterIndex];
  const isLastChapter = currentChapterIndex === totalChapters - 1;

  // Parse markdown content to plain text (simple version)
  const parseMarkdown = (content: string): string => {
    // Remove markdown formatting but keep the text
    return content
      .replace(/^#{1,6}\s+/gm, '') // Remove headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
      .trim();
  };

  // Get button text based on current chapter and transition intent
  const getButtonText = (): string => {
    // Use configured button text from chapter data, or fall back to default
    return currentChapter.buttonText || 'yield to the next';
  };

  const handleProceed = () => {
    if (isTransitioning || currentChapterIndex >= totalChapters - 1) return;

    setIsTransitioning(true);
    setFadeState('fading');

    // After fade out, switch chapter
    setTimeout(() => {
      setFadeState('hidden');
      setPreviousChapters([...previousChapters, currentChapterIndex]);
      setCurrentChapterIndex(currentChapterIndex + 1);
      
      // Scroll to top while hidden
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }

      // Wait for visual transition to complete before fading in new chapter
      // Use the configured transition duration from visualConfig
      setTimeout(() => {
        setFadeState('visible');
        setIsTransitioning(false);
      }, visualConfig.transitions.duration);
    }, 800);
  };



  // Special handling for the last chapter (glitch effect)
  const isGlitching = currentChapterIndex === totalChapters - 1;

  // Get current chapter theme color for styling
  const themeColor = currentChapter.themeColor;

  return (
    <div 
      className={`reader ${isGlitching ? 'glitching' : ''}`}
      style={{
        // Apply theme color to background
        backgroundColor: themeColor,
      }}
    >
      {/* Timeline - shows evolutionary progression */}
      <Timeline 
        currentChapterId={currentChapterIndex + 1} 
        themeColor={themeColor} 
      />

      {/* Background gradient */}
      <div 
        className="background-gradient"
        style={{
          // Apply theme-tinted gradient
          background: `radial-gradient(
            ellipse at center,
            ${themeColor}dd 0%,
            ${themeColor}ff 50%,
            ${themeColor} 100%
          )`,
        }}
      />

      {/* Visual module canvas */}
      <canvas
        ref={visualCanvasRef}
        className="visual-canvas"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />

      {/* Ghost layers of previous chapters */}
      <div className="ghost-layers">
        {previousChapters.slice(-3).map((chapterIdx, i) => (
          <div
            key={chapterIdx}
            className="ghost-layer"
            style={{
              opacity: 0.02 + (i * 0.01),
              filter: `blur(${4 - i}px)`,
            }}
          >
            {parseMarkdown(chapters[chapterIdx].content)}
          </div>
        ))}
      </div>

      {/* Current chapter content */}
      <div 
        ref={contentRef}
        className={`content-container ${fadeState}`}
      >
        <div className="chapter-text">
          {parseMarkdown(currentChapter.content)}
        </div>
      </div>

      {/* Proceed button */}
      {!isLastChapter && (
        <button
          className={`proceed-button ${isTransitioning ? 'disabled' : ''}`}
          onClick={handleProceed}
          disabled={isTransitioning}
        >
          <span className="proceed-symbol">⟶</span>
          <span className="proceed-text">{getButtonText()}</span>
        </button>
      )}

      {/* Final state - no button, just dissolution */}
      {isLastChapter && (
        <div className="final-marker">
          <div className="corruption-symbols">
            ▚▞▚▞▝▗▝
          </div>
        </div>
      )}

      {/* Audio controls */}
      <AudioControl
        orchestrator={orchestrator}
        audioContextRef={audioContextRef}
        isReady={isAudioReady}
        isPlaying={isAudioPlaying}
        onInit={initAudio}
        onPause={pauseAudio}
        onResume={resumeAudio}
        className="reader-audio-control"
      />
    </div>
  );
};

export default Reader;
