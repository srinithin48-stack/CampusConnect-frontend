import React from 'react';
import NavigationLink from './NavLink';

function Navbar() {
  return (
    <nav className="navbar">
      <NavigationLink to="/" className="brand">
        <span className="brand-mark">CC</span>
        <span>CampusConnect</span>
      </NavigationLink>
      <div className="nav-links">
        <NavigationLink to="/">Home</NavigationLink>
        <NavigationLink to="/events">Events</NavigationLink>
        <NavigationLink to="/about">About</NavigationLink>
        <NavigationLink to="/register">Register</NavigationLink>
        <NavigationLink to="/contact">Contact</NavigationLink>
      </div>
    </nav>
  );
}

export default Navbar;
