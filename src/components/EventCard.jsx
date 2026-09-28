import React from 'react';

function EventCard({ event, isExpanded, onToggle }) {
  const details = Array.isArray(event.details) ? event.details : [];
  const date = event.date || event.schedule?.date || event.schedule?.start || 'Date to be announced';
  const venue = event.venue || event.location || event.schedule?.venue || 'Venue to be announced';
  return (
    <article className={`event-card${isExpanded ? ' active' : ''}`}>
      <div className="event-head">
        <span className="category-pill">{event.category || 'General'}</span>
        <strong>📅 {date}</strong>
      </div>
      <h3>{event.title || event.name || 'Untitled event'}</h3>
      <p>📍 {venue}</p>
      <p>{event.description || event.summary || 'More details will be shared soon.'}</p>
      <button className="detail-btn" type="button" onClick={onToggle}>
        {isExpanded ? 'Hide Details' : 'View Details'}
      </button>
      <div className={`event-details${isExpanded ? '' : ' hidden'}`} hidden={!isExpanded}>
        <ul>
          {details.map((item) => (
            <li key={item}>{item}</li>
          ))}
          {!details.length && event.schedule && <li>{typeof event.schedule === 'string' ? event.schedule : JSON.stringify(event.schedule)}</li>}
        </ul>
      </div>
    </article>
  );
}

export default EventCard;
