import React from 'react';
import EventCard from './EventCard';

function EventList({ events, expandedEventId, onToggleExpanded }) {
  return (
    <section className="events-grid" aria-live="polite">
      {events.length === 0 ? (
        <article className="event-card">
          <h3>No events found</h3>
          <p>Try a different keyword or category filter.</p>
        </article>
      ) : (
        events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isExpanded={expandedEventId === event.id}
            onToggle={() => onToggleExpanded(event.id)}
          />
        ))
      )}
    </section>
  );
}

export default EventList;
