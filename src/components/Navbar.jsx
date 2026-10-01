import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationLink from './NavLink';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        {isAuthenticated ? (
          <button type="button" className="nav-link nav-auth" onClick={handleLogout}>Logout</button>
        ) : (
          <NavigationLink to="/login" className="nav-auth">Login</NavigationLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
