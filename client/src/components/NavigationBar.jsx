import React from "react";
import { NavLink } from "react-router-dom";
import "./NavigationBar.css";

function NavigationBar() {
  return (
    <nav className="navigation-bar">
      <ul>
        <li>ADD LOGO HERE</li>
        <li>
          <NavLink to="/Dashboard">Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/node-details">Node Details</NavLink>
        </li>
        <li>
          <NavLink to="/alerts">Alerts</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default NavigationBar;
