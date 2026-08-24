import React from 'react';
import { NavLink } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-brand">{'\u00A9'} 2026 CampusConnect</p>
      <p className="footer-info">Built with React <span aria-hidden="true">{'\u2022'}</span> CSS <span aria-hidden="true">{'\u2022'}</span> Student Event Management</p>
      <nav className="footer-links" aria-label="Footer navigation">
        <NavLink to="/">Home</NavLink>
        <span aria-hidden="true">{'\u2022'}</span>
        <NavLink to="/events">Events</NavLink>
        <span aria-hidden="true">{'\u2022'}</span>
        <NavLink to="/about">About</NavLink>
         <span aria-hidden="true">{'\u2022'}</span>
        <NavLink to="/register">Register</NavLink>
         <span aria-hidden="true">{'\u2022'}</span>
        <NavLink to="/contact">Contact</NavLink>
      </nav>
    </footer>
  );
}

export default Footer;
