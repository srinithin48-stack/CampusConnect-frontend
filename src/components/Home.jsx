import React from 'react';
import { Link } from 'react-router-dom';
import Hero from './Hero';
import Stats from './Stats';

function Home() {
  return (
    <div className="home-page">
      <Hero />
      <section className="home-lower">
        <Stats />
        <aside className="home-cta">
          <h2>Ready to join campus life?</h2>
          <p>
            CampusConnect brings the best campus events into one place so you can plan, register, and stay informed with ease.
          </p>
          <div className="home-cta-actions">
            <Link className="home-button primary" to="/events">
              Browse events
              <svg className="home-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <Link className="home-text-link" to="/register">Register now</Link>
          </div>
          <svg className="home-plane" viewBox="0 0 120 70" aria-hidden="true">
            <path d="M8 62c14 4 26-2 30-10 4-9-6-12-8-5-2 8 14 10 28 2 10-6 20-16 28-26" strokeDasharray="3 4" />
            <path d="M84 20 116 4 104 34l-9-8-7 8 1-10Z" />
            <path d="m95 26 21-22" />
          </svg>
        </aside>
      </section>
    </div>
  );
}

export default Home;
