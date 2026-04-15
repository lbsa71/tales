/**
 * Visual Canvas Component
 * 
 * React component wrapper for the visual module canvas.
 * Provides a full-screen canvas layer that sits behind the text content.
 */

import { useEffect, useRef } from 'react';
import './VisualCanvas.css';

interface VisualCanvasProps {
  chapterId: number;
  className?: string;
}

export const VisualCanvas: React.FC<VisualCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Canvas element is ready, parent will handle orchestrator setup
    // This component just provides the canvas element
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`visual-canvas ${className}`}
      aria-hidden="true"
    />
  );
};

export default VisualCanvas;
