import React from 'react';
import { NavLink } from 'react-router-dom';

function NavigationLink({ to, children, className = '' }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${className} nav-link${isActive ? ' active' : ''}`.trim()}
    >
      {children}
    </NavLink>
  );
}

export default NavigationLink;
