import { useMemo } from 'react';
import { getVisibleEvents } from './timelineData';
import './Timeline.css';

interface TimelineProps {
  currentChapterId: number; // 1-based chapter index
  themeColor: string;
}

/**
 * Timeline component showing evolutionary events
 * Current rung is centered at 50%, previous rungs are proportionally spaced before it
 */
export const Timeline = ({ currentChapterId, themeColor }: TimelineProps) => {
  const visibleEvents = useMemo(
    () => getVisibleEvents(currentChapterId),
    [currentChapterId]
  );

  /**
   * Convert an event to a position on the timeline (0-100%)
   * Current rung is centered at 50%, previous rungs are proportionally spaced based on epoch length
   */
  const getPosition = (event: typeof visibleEvents[0]): number => {
    const isCurrent = event.chapterId === currentChapterId;
    const isPast = event.chapterId < currentChapterId;

    // Current rung is always centered at 50%
    if (isCurrent) {
      return 50;
    }

    // For past events, calculate time-based proportional spacing using logarithmic scale
    if (isPast) {
      // Find current event to get its time
      const currentEvent = visibleEvents.find(e => e.chapterId === currentChapterId);
      if (!currentEvent) {
        return 10; // Fallback if current event not found
      }

      // Find all past events (including Earth creation if it's before current)
      const pastEvents = visibleEvents
        .filter(e => e.chapterId < currentChapterId)
        .sort((a, b) => b.yearsAgo - a.yearsAgo); // Sort by time (oldest first)

      if (pastEvents.length === 0) {
        return 10; // Default position if no past events
      }

      // Get time range: from oldest past event to current event
      const oldestTime = Math.max(...pastEvents.map(e => e.yearsAgo));
      const currentTime = currentEvent.yearsAgo;

      // Use logarithmic scale for better visualization of vast time spans
      // Handle negative values (future events) and zero carefully
      const logOldest = Math.log10(Math.abs(oldestTime) + 1);
      const logCurrent = Math.log10(Math.abs(currentTime) + 1);
      const logEvent = Math.log10(Math.abs(event.yearsAgo) + 1);

      // Map this event's time to position (10% to 45%) using logarithmic interpolation
      const startPosition = 10; // Oldest events at 10%
      const endPosition = 45; // Most recent past events near current at 50%
      const availableSpace = endPosition - startPosition;

      if (logOldest === logCurrent) {
        // If all events are at same time, position near current
        return endPosition;
      }

      // Calculate position based on logarithmic time proportion
      // Proportion: 0 = at current time, 1 = at oldest time
      const logRange = logOldest - logCurrent;
      const logFromCurrent = logEvent - logCurrent;
      const logProportion = logFromCurrent / logRange;

      // Map proportion to position: 0 -> endPosition (45%), 1 -> startPosition (10%)
      const position = endPosition - (logProportion * availableSpace);

      return Math.max(startPosition, Math.min(endPosition, position));
    }

    // Future events (next event) - position after 50%
    // Position it at 75% to show it's coming but not the focus
    return 75;
  };

  /**
   * Format years for display
   */
  const formatYears = (yearsAgo: number): string => {
    const abs = Math.abs(yearsAgo);
    
    if (abs >= 1_000_000_000) {
      return `${(abs / 1_000_000_000).toFixed(1)}Ga`;
    } else if (abs >= 1_000_000) {
      return `${(abs / 1_000_000).toFixed(0)}Ma`;
    } else if (abs >= 1_000) {
      return `${(abs / 1_000).toFixed(0)}Ka`;
    } else {
      return `${abs}y`;
    }
  };

  return (
    <div className="timeline" data-testid="timeline">
      <div className="timeline-container">
        {/* Timeline bar */}
        <div 
          className="timeline-bar"
          style={{ 
            background: `linear-gradient(to right, ${themeColor}40, ${themeColor}80)` 
          }}
        />

        {/* Events */}
        {visibleEvents.map((event) => {
          const position = getPosition(event);
          const isCurrent = event.chapterId === currentChapterId;
          const isPast = event.chapterId < currentChapterId;
          const isNext = event.chapterId === currentChapterId + 1;
          const isPrevious = event.chapterId === currentChapterId - 1;

          // Show labels only for current and previous rung
          const shouldShowLabel = isCurrent || isPrevious;

          return (
            <div
              key={event.id}
              className={`timeline-event ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''} ${isNext ? 'next' : ''}`}
              style={{ left: `${position}%` }}
              data-testid={`timeline-event-${event.id}`}
            >
              {/* Event marker - always show for all events */}
              <div 
                className="timeline-marker"
                style={{
                  backgroundColor: isCurrent ? themeColor : `${themeColor}60`,
                  boxShadow: isCurrent ? `0 0 8px ${themeColor}` : 'none',
                }}
              />

              {/* Event label - only show for current and previous rung */}
              {shouldShowLabel && (
                <div className="timeline-label">
                  <div className="timeline-name">{event.name}</div>
                  <div className="timeline-time">{formatYears(event.yearsAgo)}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
