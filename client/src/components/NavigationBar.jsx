import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import logo from "../assets/ARCOMLogo2.png";
import "./NavigationBar.css";

function NavigationBar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default NavigationBar;
