import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-brand">🏠 My Dashboard</span>
      <ul className="navbar-nav">
        <li>
          <NavLink to="/fitness" activeClassName="active">
            🏋️ Fitness
          </NavLink>
        </li>
        <li>
          <NavLink to="/food" activeClassName="active">
            🥗 Food Log
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
