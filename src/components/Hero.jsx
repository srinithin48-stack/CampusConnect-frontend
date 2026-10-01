import React from 'react';
import { Link } from 'react-router-dom';

const ArrowIcon = () => (
  <svg className="home-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

function CampusIllustration() {
  return (
    <svg className="home-illustration" viewBox="0 0 320 200" aria-hidden="true">
      <ellipse cx="160" cy="186" rx="150" ry="10" fill="#dce8fb" />
      <path d="M232 188c6-58 44-86 70-70 12-22-8-50-36-40-16-30-60-24-66 8-26 6-26 44 0 50" fill="#e6effc" />
      {/* Main building */}
      <path d="M100 86 160 58l60 28Z" fill="#b9d0f5" />
      <rect x="108" y="86" width="104" height="96" fill="#dbe7fb" />
      <rect x="104" y="82" width="112" height="8" rx="2" fill="#c3d6f6" />
      <rect x="148" y="42" width="24" height="26" fill="#cfdff9" />
      <path d="M144 44 160 32l16 12Z" fill="#a9c4f2" />
      <path d="M160 32V14" stroke="#7fa6ea" strokeWidth="2" />
      <path d="M160 14h14l-4 5 4 5h-14Z" fill="#6f9be8" />
      {[118, 134, 176, 192].map((x) => <rect key={x} x={x} y="98" width="10" height="30" rx="2" fill="#a9c4f2" />)}
      {[118, 134, 176, 192].map((x) => <rect key={`b${x}`} x={x} y="140" width="10" height="24" rx="2" fill="#a9c4f2" />)}
      <rect x="150" y="136" width="20" height="46" rx="2" fill="#8fb2ee" />
      <rect x="146" y="96" width="28" height="32" rx="3" fill="#b9d0f5" />
      {/* Wings */}
      <rect x="62" y="118" width="46" height="64" fill="#e3edfc" />
      <rect x="212" y="118" width="46" height="64" fill="#e3edfc" />
      <rect x="58" y="112" width="54" height="7" rx="2" fill="#c9daf7" />
      <rect x="208" y="112" width="54" height="7" rx="2" fill="#c9daf7" />
      {[70, 88].map((x) => <rect key={`l${x}`} x={x} y="130" width="10" height="16" rx="2" fill="#b3cbf4" />)}
      {[222, 240].map((x) => <rect key={`r${x}`} x={x} y="130" width="10" height="16" rx="2" fill="#b3cbf4" />)}
      {[70, 88].map((x) => <rect key={`l2${x}`} x={x} y="156" width="10" height="16" rx="2" fill="#b3cbf4" />)}
      {[222, 240].map((x) => <rect key={`r2${x}`} x={x} y="156" width="10" height="16" rx="2" fill="#b3cbf4" />)}
      <rect x="96" y="180" width="128" height="6" rx="2" fill="#c3d6f6" />
      {/* Trees and bushes */}
      <path d="M40 184v-40" stroke="#8fb2ee" strokeWidth="3" />
      <ellipse cx="40" cy="136" rx="20" ry="28" fill="#9dbdf0" />
      <path d="M284 184v-34" stroke="#8fb2ee" strokeWidth="3" />
      <ellipse cx="284" cy="142" rx="15" ry="22" fill="#9dbdf0" />
      <ellipse cx="76" cy="182" rx="24" ry="10" fill="#b3cbf4" />
      <ellipse cx="246" cy="182" rx="24" ry="10" fill="#b3cbf4" />
      <ellipse cx="58" cy="186" rx="16" ry="7" fill="#9dbdf0" />
      <ellipse cx="264" cy="186" rx="16" ry="7" fill="#9dbdf0" />
    </svg>
  );
}

function Hero() {
  return (
    <header className="home-hero">
      <div className="home-hero-copy">
        <p className="home-eyebrow">College Events Portal</p>
        <h1>Discover the next big campus experience</h1>
        <p>
          Explore student-led workshops, tech challenges, cultural showcases, and sports events in one polished destination.
        </p>
        <div className="home-hero-actions">
          <Link className="home-button primary" to="/events">Explore Events <ArrowIcon /></Link>
          <Link className="home-button outline" to="/about">Why join?</Link>
        </div>
      </div>

      <CampusIllustration />

      <aside className="home-featured" aria-label="Featured event summary">
        <span className="home-icon-tile" aria-hidden="true">
          <svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M16 14h.01M8 17h2M12 17h2" /></svg>
        </span>
        <div className="home-featured-body">
          <p className="home-eyebrow small">Featured event</p>
          <h2>AI Hackathon Sprint</h2>
          <div className="home-featured-meta">
            <span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
              Aug 12, 2026
            </span>
            <span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
              Innovation Lab
            </span>
          </div>
          <p>Join teams from across campus for innovation, coding, and exciting prize opportunities.</p>
          <ul>
            <li>Open to all departments</li>
            <li>Mentor support available</li>
            <li>Register through the campus portal</li>
          </ul>
        </div>
      </aside>
    </header>
  );
}

export default Hero;
