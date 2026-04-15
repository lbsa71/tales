# Timeline Component

## Overview

The Timeline component displays the evolutionary progression of intelligence rungs across deep time, from Earth's formation (4.5 billion years ago) to the unknowable successor in the future.

## Features

- **Logarithmic Scale**: Handles vast time spans (billions of years) on a single visual timeline
- **Smart Visibility**: Shows past events, current event, and next event (unlabeled)
- **Theme Integration**: Uses chapter-specific theme colors for visual cohesion
- **Responsive Design**: Adapts to mobile with simplified display
- **Accessibility**: Respects `prefers-reduced-motion` and includes proper ARIA attributes

## Usage

```tsx
import { Timeline } from './components/Timeline';

<Timeline 
  currentChapterId={7}  // 1-based chapter index
  themeColor="#0a0e14" // Chapter theme color
/>
```

## Timeline Events

The timeline includes the following evolutionary milestones:

1. **Earth Creation** (4.5 Ga) - Starting point
2. **Replicators** (4.0 Ga) - Chapter 1
3. **Protocells** (3.8 Ga) - Chapter 2
4. **RNA Organisms** (3.5 Ga) - Chapter 3
5. **Early Cells** (3.4 Ga) - Chapter 4
6. **Multicellular Life** (1.5 Ga) - Chapter 5
7. **Sentient Animals** (500 Ma) - Chapter 6
8. **Humans** (300 Ka) - Chapter 7
9. **Anthropocene** (200 y) - Chapter 7 (special event)
10. **Machine Minds** (50 years future) - Chapter 8
11. **Successor** (200 years future) - Chapter 9 (never labeled)

## Display Rules

### Label Visibility
- **Past events**: Always show labels
- **Current event**: Always show label (with pulse animation)
- **Next event**: Show marker but NO label (defines timeline extent)
- **Successor**: NEVER show label (unknowable future)

### Special Cases
- **Anthropocene**: Additional event on Chapter 7 (Humans), both "Humans" and "Anthropocene" show
- **Successor**: On Chapter 8, shows marker but never a label

## Styling

The timeline uses:
- Subtle opacity (0.9) to not distract from content
- Theme-aware colors for markers and bars
- Pulse animation on current event
- Smooth transitions for all interactions
- Mobile-responsive font sizes and marker sizes

## Technical Details

### Logarithmic Scale Calculation

```typescript
const logStart = Math.log10(Math.abs(start) + 1);
const logEnd = Math.log10(Math.abs(end) + 1);
const logValue = Math.log10(Math.abs(yearsAgo) + 1);
const position = ((logStart - logValue) / (logStart - logEnd)) * 100;
```

This ensures all events are visible despite the vast time differences.

### Time Format Abbreviations
- **Ga**: Giga-annum (billions of years)
- **Ma**: Mega-annum (millions of years)
- **Ka**: Kilo-annum (thousands of years)
- **y**: Years

## Accessibility

- `pointer-events: none` on container to not block content
- `pointer-events: auto` on event markers for interaction
- `aria-hidden="true"` on decorative elements
- Respects `prefers-reduced-motion` media query
- Sufficient color contrast for visibility

## Mobile Behavior

On screens ≤768px wide:
- Event names hidden by default
- Event names shown on hover/tap
- Current event name always visible
- Smaller markers and fonts
- Reduced padding
