// Timeline data for evolutionary rungs
// All dates are in "years ago" (negative values indicate future from present)

export interface TimelineEvent {
  id: string;
  name: string;
  yearsAgo: number; // Positive = past, Negative = future
  chapterId: number; // Which chapter this event relates to (1-based)
  showLabel: boolean; // Whether to show the label on the timeline
}

// Earth formation is our starting point
const EARTH_FORMATION = 4_500_000_000; // 4.5 billion years ago

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'earth-creation',
    name: 'Earth Creation',
    yearsAgo: EARTH_FORMATION,
    chapterId: 0, // Not associated with a specific chapter
    showLabel: true,
  },
  {
    id: 'replicators',
    name: 'Replicators',
    yearsAgo: 4_000_000_000, // 4 billion years ago
    chapterId: 1,
    showLabel: true,
  },
  {
    id: 'protocells',
    name: 'Protocells',
    yearsAgo: 3_800_000_000, // 3.8 billion years ago
    chapterId: 2,
    showLabel: true,
  },
  {
    id: 'rna-organisms',
    name: 'RNA',
    yearsAgo: 3_500_000_000, // 3.5 billion years ago
    chapterId: 3,
    showLabel: true,
  },
  {
    id: 'early-cells',
    name: 'Early Cells',
    yearsAgo: 3_400_000_000, // 3.4 billion years ago (slightly after RNA)
    chapterId: 4,
    showLabel: true,
  },
  {
    id: 'multicellular',
    name: 'Multicellular Life',
    yearsAgo: 1_500_000_000, // 1.5 billion years ago
    chapterId: 5,
    showLabel: true,
  },
  {
    id: 'sentient-animals',
    name: 'Sentient Animals',
    yearsAgo: 500_000_000, // 500 million years ago
    chapterId: 6,
    showLabel: true,
  },
  {
    id: 'humans',
    name: 'Symbolic Minds',
    yearsAgo: 300_000, // 300,000 years ago
    chapterId: 7,
    showLabel: true,
  },
  {
    id: 'machine-minds',
    name: 'Architecture',
    yearsAgo: -50, // 50 years in the future (negative = future)
    chapterId: 8,
    showLabel: true,
  },
  {
    id: 'successor',
    name: 'The Pattern', // Never displayed per requirements - unknowable future
    yearsAgo: -200, // 200 years in the future
    chapterId: 9, // The unknowable next
    showLabel: false, // Never show label per requirements
  },
];

/**
 * Get events that should be visible for a given chapter
 * Shows: past events + current event + next event (unlabeled)
 * @param currentChapterId - The current chapter number (1-based index)
 * @returns Array of timeline events to display
 */
export const getVisibleEvents = (currentChapterId: number): TimelineEvent[] => {
  // Find all events up to and including the current chapter
  const pastAndCurrentEvents = timelineEvents.filter(
    (event) => event.chapterId <= currentChapterId
  );

  // Find the next event (if any) to define the timeline extent
  const nextEvent = timelineEvents.find(
    (event) => event.chapterId === currentChapterId + 1
  );

  // Combine them
  const visible = [...pastAndCurrentEvents];
  if (nextEvent) {
    // Add next event but mark it as unlabeled
    visible.push({ ...nextEvent, showLabel: false });
  }

  return visible;
};

/**
 * Get the time range for the visible timeline
 * @param currentChapterId - The current chapter number (1-based index)
 * @returns Object with start and end times in years ago (positive = past, negative = future)
 */
export const getTimelineRange = (
  currentChapterId: number
): { start: number; end: number } => {
  const visibleEvents = getVisibleEvents(currentChapterId);

  if (visibleEvents.length === 0) {
    return { start: EARTH_FORMATION, end: 0 };
  }

  // Always start from Earth creation
  const start = EARTH_FORMATION;

  // End is the most recent (smallest yearsAgo) visible event
  const end = Math.min(...visibleEvents.map((e) => e.yearsAgo));

  return { start, end };
};
