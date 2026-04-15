# Hooks Directory

This directory contains custom React hooks used in the Unsung Heroes reader application.

## Available Hooks

### `useGlobalTap`

A React hook that implements a global tap/click handler that **does not block scrolling**.

**Purpose:** Detect tap/click events anywhere in the document without interfering with native browser scrolling behavior (mouse wheel, touch scroll, etc.).

**Key Features:**
- Uses modern **Pointer Events API** to unify mouse, touch, and pen input
- Attaches native listeners with `capture: true` for early event processing
- **Does NOT call `preventDefault()`** - allows native scrolling to work normally
- Distinguishes taps from scrolls/drags by measuring time and distance
- Safe error handling to prevent breaking global event processing

**Usage:**

```tsx
import { useGlobalTap } from './hooks/useGlobalTap';

function MyComponent() {
  useGlobalTap((e: PointerEvent) => {
    console.log('Tap detected at', e.clientX, e.clientY);
    console.log('Target element:', e.target);
    // Perform your app-wide action here
    // DO NOT call e.preventDefault() here - it would interfere with scrolling
  });

  return <div>Your content</div>;
}
```

**Options:**

```tsx
useGlobalTap(handler, {
  maxDistance: 10,  // Maximum movement in pixels to still count as tap (default: 10)
  maxDelayMs: 500   // Maximum time in milliseconds to count as tap (default: 500)
});
```

**How it works:**

1. Records position and time on `pointerdown`
2. On `pointerup`, calculates movement distance and elapsed time
3. If movement is small (< maxDistance) and time is short (< maxDelayMs), it's a tap
4. Calls the handler only for valid taps
5. Scrolls and drags don't trigger the handler

**Browser Compatibility:**

Pointer Events are supported in all modern browsers:
- Chrome 55+
- Firefox 59+
- Safari 13+
- Edge 12+
- Mobile browsers (iOS Safari 13+, Chrome Android, etc.)

**Related Files:**
- `touch-action-guidelines.css` - CSS best practices for preventing scroll blocking
- `../Reader.css` - Contains proper `touch-action: pan-y` for scrollable containers

**References:**
- [MDN: Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [Chrome: Passive Event Listeners](https://developer.chrome.com/blog/scrolling-intervention-2)
- [React: Event Handling](https://react.dev/learn/responding-to-events)

## Why This Implementation?

**Problem:** Previous implementations of "catch taps anywhere" often caused issues:
- Non-passive touch/wheel listeners blocked native scrolling
- Calling `preventDefault()` on scroll events prevented scrolling
- Using separate touch/mouse event handlers caused emulated event conflicts
- Overlay elements with incorrect `pointer-events` CSS blocked interactions

**Solution:** This hook uses the proven cross-platform approach:
1. Pointer Events (not touch/mouse) for unified input handling
2. Native listeners (not React synthetic events) for low-level control
3. No `preventDefault()` calls - never interferes with browser behavior
4. Capture phase listening - early processing without blocking
5. Smart tap detection - distinguishes taps from scrolls/drags

**Testing Checklist:**
- [ ] Desktop: Mouse clicks trigger handler, wheel scrolling works
- [ ] Mobile: Taps trigger handler, touch scrolling works
- [ ] Mobile: Long-press/drag does NOT trigger handler
- [ ] No console warnings about passive listeners
- [ ] Scrollable text containers scroll normally
- [ ] Overlay elements (if any) work correctly

## Development Notes

**When to use:**
- Global tap detection for analytics
- Closing overlays/modals on outside clicks
- Tracking user interaction patterns
- Implementing "tap anywhere to continue" functionality

**When NOT to use:**
- For element-specific click handlers (use regular `onClick` instead)
- When you need to prevent default behavior (use targeted listeners with `passive: false`)
- For complex gesture detection (consider specialized gesture libraries)

**Performance:**
- Minimal overhead - only two global listeners
- Early return for non-primary pointers
- Safe error handling prevents cascade failures
- Cleanup on unmount prevents memory leaks
