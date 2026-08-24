import React from 'react';

const statItems = [
  { value: '8+', label: 'Campus Events', icon: '📅' },
  { value: '7', label: 'Active Clubs', icon: '👥' },
  { value: '250+', label: 'Student Registrations', icon: '🎓' },
  { value: '8', label: 'Upcoming Events', icon: '🗓️' }
];

function Stats() {
  return (
    <section className="stats-section" aria-label="Portal highlights">
      {statItems.map((item) => (
        <article key={item.label} className="stat-card">
          <div className="stat-card__copy">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
          <span className="stat-card__icon" aria-hidden="true">{item.icon}</span>
        </article>
      ))}
    </section>
  );
}

export default Stats;
