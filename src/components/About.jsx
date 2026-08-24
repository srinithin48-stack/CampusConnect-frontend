import React from 'react';

const featureItems = [
  {
    title: 'Explore',
    text: 'Browse upcoming technical, cultural, sports, workshops, and seminar events happening across the campus.'
  },
  {
    title: 'Search',
    text: 'Quickly find events using category filters and search to discover activities that match your interests.'
  },
  {
    title: 'Register',
    text: 'Register for your preferred events in just a few steps and receive confirmation for successful participation.'
  }
];

function About() {
  return (
    <section id="about" className="about-section">
      <div className="section-heading highlight">
        <h2>Why CampusConnect</h2>
      </div>

      <div className="about-page-grid">
        <div className="about-primary-column">
          <p className="about-intro">
            CampusConnect is a centralized platform that helps students discover, explore, and register for campus events with ease. From technical workshops and cultural festivals to sports tournaments and seminars, everything you need is available in one place.
          </p>

          <article className="about-content-card">
            <h3>Our Mission</h3>
            <p>To simplify campus event discovery and encourage greater student participation by providing an easy-to-use platform for exploring and registering for events.</p>
          </article>

          <article className="about-content-card about-offer-card">
            <h3>What We Offer</h3>
            <ul>
              <li>Explore a variety of campus events</li>
              <li>Search and filter events by category</li>
              <li>Quick and easy event registration</li>
              <li>Stay informed with event updates</li>
            </ul>
          </article>
        </div>

        <div className="about-feature-stack">
          {featureItems.map((feature) => (
            <article key={feature.title} className="about-feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
