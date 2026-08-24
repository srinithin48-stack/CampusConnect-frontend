import React from 'react';

function HeroSection() {
  return (
    <header className="hero">
      <div className="hero-copy">
        <p className="eyebrow">College Events Portal</p>
        <h1>Discover Upcoming Campus Events</h1>
        <p>
          Discover technical, cultural, workshop, and sports events happening across the campus. Search, filter, and explore event details.
        </p>
        <div className="hero-actions">
          <a className="hero-link" href="#events">Explore events</a>
        </div>
      </div>

      <div className="hero-side-stack">
        <aside className="hero-panel" aria-label="Featured event summary">
          <h2>Featured event</h2>
          <p className="panel-title">AI Hackathon Sprint</p>
          <div className="detail-row">
            <span>📅 August 12, 2026</span>
            <span>📍 Innovation Lab</span>
          </div>
          <p>Join teams from across campus for innovation, coding, and exciting prize opportunities.</p>
          <ul>
            <li>Open to all departments</li>
            <li>Mentor support available</li>
            <li>Register through the campus portal</li>
          </ul>
        </aside>
      </div>
    </header>
  );
}

export default HeroSection;
