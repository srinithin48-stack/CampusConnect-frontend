import React from 'react';
import { Link } from 'react-router-dom';
import Hero from './Hero';
import Stats from './Stats';

function Home() {
  return (
    <>
      <Hero />
      <section className="home-intro">
        <Stats />
        <aside className="cta-panel">
          <div className="section-heading highlight">
            <h2>Ready to join campus life?</h2>
          </div>
          <p className="page-intro">
            CampusConnect brings the best campus events into one place so you can plan, register, and stay informed with ease.
          </p>
          <div className="cta-actions">
            <Link className="hero-link primary" to="/events">Browse events</Link>
            <Link className="hero-link secondary-alt" to="/register">Register now</Link>
          </div>
        </aside>
      </section>
    </>
  );
}

export default Home;
