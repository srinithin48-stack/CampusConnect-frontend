import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <header className="hero">
      <div className="hero-copy">
        <p className="eyebrow">College Events Portal</p>
        <h1>Discover the next big campus experience</h1>
        <p>
          Explore student-led workshops, tech challenges, cultural showcases, and sports events in one polished destination.
        </p>
        <div className="hero-actions">
          <Link className="hero-link primary" to="/events">Explore events</Link>
          <Link className="hero-link secondary hero-button" to="/about">Why join?</Link>
        </div>
      </div>

      <div className="hero-side-stack">
        <aside className="hero-panel" aria-label="Featured event summary">
          <div className="panel-badge">Featured event</div>
          <h2>AI Hackathon Sprint</h2>
          <div className="detail-row">
            <span>📅 Aug 12, 2026</span>
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

export default Hero;
