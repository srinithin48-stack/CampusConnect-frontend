import React from 'react';

const icons = {
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M16 14h.01M8 17h2M12 17h2" /></>,
  clubs: <><circle cx="9" cy="8" r="3.2" /><circle cx="16.5" cy="9" r="2.6" /><path d="M3 19c0-3.6 2.7-6 6-6s6 2.4 6 6Z" /><path d="M15 13.3c.5-.2 1-.3 1.5-.3 2.6 0 4.5 1.9 4.5 5h-5" /></>,
  cap: <><path d="M12 5 2 10l10 5 10-5-10-5Z" /><path d="M6 12.2V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-3.8" /></>,
  upcoming: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /><path d="m9 15 2 2 4-4" /></>
};

const statItems = [
  { value: '8+', label: 'Campus Events', icon: 'calendar', text: "From workshops to competitions, there's something for everyone." },
  { value: '7', label: 'Active Clubs', icon: 'clubs', text: 'Join clubs, meet like-minded people and grow together.' },
  { value: '250+', label: 'Student Registrations', icon: 'cap', text: 'Be a part of a vibrant student community.' },
  { value: '8', label: 'Upcoming Events', icon: 'upcoming', text: "Don't miss out on exciting events and opportunities." }
];

function Stats() {
  return (
    <section className="home-stats" aria-label="Portal highlights">
      {statItems.map((item) => (
        <article key={item.label} className="home-stat">
          <span className={`home-icon-tile${item.icon === 'clubs' || item.icon === 'cap' ? ' filled' : ''}`} aria-hidden="true">
            <svg viewBox="0 0 24 24">{icons[item.icon]}</svg>
          </span>
          <strong>{item.value}</strong>
          <h3>{item.label}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </section>
  );
}

export default Stats;
