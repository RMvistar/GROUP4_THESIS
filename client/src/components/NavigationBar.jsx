import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/ARCOMLogo2.png";
import "./NavigationBar.css";

function NavigationBar() {
  return (
    <nav className="navigation-bar">
      <ul>
        <li>
          <div className="logo-container">
            <img src={logo} alt="ARCOM Logo" className="logo" />
          </div>
        </li>
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
