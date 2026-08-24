import React from 'react';

function EventCard({ event, isExpanded, onToggle }) {
  return (
    <article className={`event-card${isExpanded ? ' active' : ''}`}>
      <div className="event-head">
        <span className="category-pill">{event.category}</span>
        <strong>📅 {event.date}</strong>
      </div>
      <h3>{event.title}</h3>
      <p>📍 {event.venue}</p>
      <p>{event.description}</p>
      <button className="detail-btn" type="button" onClick={onToggle}>
        {isExpanded ? 'Hide Details' : 'View Details'}
      </button>
      <div className={`event-details${isExpanded ? '' : ' hidden'}`} hidden={!isExpanded}>
        <ul>
          {event.details.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default EventCard;
