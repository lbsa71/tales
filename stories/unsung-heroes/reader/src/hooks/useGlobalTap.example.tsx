/**
 * Example: Using useGlobalTap Hook
 * 
 * This example demonstrates how to use the useGlobalTap hook to detect
 * taps anywhere in the document without blocking scroll.
 * 
 * You can integrate this into your App or Reader component.
 */

import { useState, useRef } from 'react';
import { useGlobalTap } from './useGlobalTap';

/**
 * Example Component with Global Tap Detection
 */
export function ExampleGlobalTapComponent() {
  // Example 1: Basic usage
  useGlobalTap((e) => {
    console.log('Global tap detected!');
    console.log('Position:', e.clientX, e.clientY);
    console.log('Target:', e.target);
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1>Global Tap Example</h1>
      <p>Try tapping anywhere on the page. Check the console for tap events.</p>
      <div style={{ 
        height: '200vh', 
        background: 'linear-gradient(to bottom, #333, #000)' 
      }}>
        <p>Scroll this long content - scrolling should work normally!</p>
        <p style={{ marginTop: '100vh' }}>Middle section</p>
        <p style={{ marginTop: '100vh' }}>Bottom section</p>
      </div>
    </div>
  );
}

/**
 * Example 2: Custom tap detection parameters
 */
export function ExampleWithCustomParams() {
  // More sensitive tap detection (smaller distance, shorter time)
  useGlobalTap(
    (e) => {
      console.log('Quick tap detected at', e.clientX, e.clientY);
    },
    {
      maxDistance: 5,   // Only 5px movement allowed
      maxDelayMs: 200   // Must complete within 200ms
    }
  );

  return <div>Component with stricter tap detection</div>;
}

/**
 * Example 3: Close modal on outside tap
 */
export function ExampleModalCloseOnOutsideTap() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useGlobalTap((e) => {
    // Close modal if tap is outside the modal element
    if (isModalOpen && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setIsModalOpen(false);
    }
  });

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>Open Modal</button>
      
      {isModalOpen && (
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            pointerEvents: 'none' // Let taps pass through to global handler
          }} />
          
          <div 
            ref={modalRef}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              pointerEvents: 'auto' // Capture taps on modal itself
            }}
          >
            <h2>Modal Content</h2>
            <p>Tap outside to close</p>
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Integration Example: Add to Reader or App component
 */
export function IntegrateIntoReaderExample() {
  // Add analytics tracking
  useGlobalTap((_e) => {
    // Track user interactions for analytics
    // analytics.trackTap({ x: e.clientX, y: e.clientY, target: e.target });
    console.log('User interaction tracked');
  });

  return (
    <div>
      {/* Your existing reader content */}
    </div>
  );
}
