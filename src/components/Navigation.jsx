import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navigation = () => {
  const location = useLocation();
  
  if (location.pathname === '/checkin') {
    return null; // Hide navigation for students
  }

  return (
    <nav className="glass-nav">
      <div className="nav-brand">Flutter Workshop</div>
      <div className="nav-links">
        <NavLink to="/" end>Registration</NavLink>
        <NavLink to="/scanner">Scanner</NavLink>
        <NavLink to="/attendance">Records</NavLink>
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navigation;
