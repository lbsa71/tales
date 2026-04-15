// useGlobalTap.ts
import { useEffect, useRef } from "react";

type TapHandler = (event: PointerEvent) => void;

export function useGlobalTap(onTap: TapHandler, opts?: { maxDistance?: number; maxDelayMs?: number }) {
  const onTapRef = useRef(onTap);
  
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const maxDistance = opts?.maxDistance ?? 10; // px
  const maxDelayMs = opts?.maxDelayMs ?? 500; // ms

  // Update ref in effect to avoid accessing during render
  useEffect(() => {
    onTapRef.current = onTap;
  }, [onTap]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const target = e.target as HTMLElement;
      const isContentContainer = target?.closest?.('.content-container') !== null;
      
      console.log('[useGlobalTap] pointerdown:', {
        clientX: e.clientX,
        clientY: e.clientY,
        target: target?.tagName,
        className: target?.className,
        isContentContainer,
        isPrimary: e.isPrimary,
        pointerType: e.pointerType,
        button: e.button,
      });

      // Only consider primary buttons/contacts
      if (e.isPrimary === false) {
        console.log('[useGlobalTap] pointerdown: ignoring non-primary pointer');
        return;
      }
      
      // Record start position & time
      startRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
      console.log('[useGlobalTap] pointerdown: recorded start', startRef.current);
    }

    function onPointerUp(e: PointerEvent) {
      const target = e.target as HTMLElement;
      const isContentContainer = target?.closest?.('.content-container') !== null;
      
      console.log('[useGlobalTap] pointerup:', {
        clientX: e.clientX,
        clientY: e.clientY,
        target: target?.tagName,
        className: target?.className,
        isContentContainer,
        isPrimary: e.isPrimary,
        pointerType: e.pointerType,
        button: e.button,
        hasStart: !!startRef.current,
      });

      const start = startRef.current;
      startRef.current = null;
      
      if (!start) {
        console.log('[useGlobalTap] pointerup: no start recorded, ignoring');
        return;
      }

      // Only primary pointer
      if (e.isPrimary === false) {
        console.log('[useGlobalTap] pointerup: ignoring non-primary pointer');
        return;
      }

      const dt = Date.now() - start.t;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);

      console.log('[useGlobalTap] pointerup: tap detection:', {
        dt,
        maxDelayMs,
        dist,
        maxDistance,
        isTap: dt <= maxDelayMs && distSq <= maxDistance * maxDistance,
      });

      if (dt <= maxDelayMs && distSq <= maxDistance * maxDistance) {
        // It's a tap — call handler
        console.log('[useGlobalTap] pointerup: TAP DETECTED, calling handler');
        try {
          onTapRef.current(e);
          console.log('[useGlobalTap] pointerup: handler called successfully');
        } catch (err) {
          // keep safe: do not break global event processing
          console.error('[useGlobalTap] pointerup: handler error', err);
        }
      } else {
        console.log('[useGlobalTap] pointerup: not a tap (too much movement or too long)');
      }
    }

    // Use pointer events to unify touch/mouse/pen input.
    // Use capture so it runs early but DO NOT call preventDefault -> don't interfere with scrolling.
    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    document.addEventListener("pointerup", onPointerUp, { capture: true });

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, { capture: true });
      document.removeEventListener("pointerup", onPointerUp, { capture: true });
    };
  }, [maxDistance, maxDelayMs]);
}
