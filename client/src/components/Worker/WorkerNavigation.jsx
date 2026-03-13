import { useState, useEffect } from "react";
import {
  FaChartLine,
  FaNetworkWired,
  FaBell,
  FaEllipsisV,
  FaUser,
  FaTasks,
  FaCog,
} from "react-icons/fa";
import logo from "../../assets/ARCOMLogo2.png";
import "./WorkerNavigation.css";

function WorkerNavigation({ activeSection, onSectionChange }) {
  return (
    <div className="worker-navigation-wrapper">
      {/* User Profile Section */}
      <div className="logo-container">
        <img src={logo} alt="ARCOM Logo" className="logo" />
        <h1>RCOM</h1>
      </div>
      <div className="nav-profile">
        <div className="profile-avatar">
          <FaUser />
        </div>
        <div className="profile-info">
          <span className="profile-name">Worker</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        {/* Dashboard */}
        <div
          className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`}
          onClick={() => onSectionChange("dashboard")}
        >
          <span className="nav-icon">
            <FaChartLine />
          </span>
          <span className="nav-label">Dashboard</span>
        </div>

        {/* Node Details */}
        <div
          className={`nav-item ${activeSection === "node-details" ? "active" : ""}`}
          onClick={() => onSectionChange("node-details")}
        >
          <span className="nav-icon">
            <FaNetworkWired />
          </span>
          <span className="nav-label">Node Details</span>
        </div>

        {/* Alerts */}
        <div
          className={`nav-item ${activeSection === "alerts" ? "active" : ""}`}
          onClick={() => onSectionChange("alerts")}
        >
          <span className="nav-icon">
            <FaBell />
          </span>
          <span className="nav-label">Alerts</span>
        </div>

        {/* Tasks */}
        <div
          className={`nav-item ${activeSection === "tasks" ? "active" : ""}`}
          onClick={() => onSectionChange("tasks")}
        >
          <span className="nav-icon">
            <FaTasks />
          </span>
          <span className="nav-label">Tasks</span>
        </div>

        <div
          className={`nav-item ${activeSection === "account-settings" ? "active" : ""}`}
          onClick={() => onSectionChange("account-settings")}
        >
          <span className="nav-icon">
            <FaCog />
          </span>
          <span className="nav-label">Account Settings</span>
        </div>

        <button className="log-out-button">Log out</button>
      </nav>
    </div>
  );
}

export default WorkerNavigation;
