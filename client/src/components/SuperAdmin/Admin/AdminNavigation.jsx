import { useState, useEffect } from "react";
import {
  FaChartLine,
  FaNetworkWired,
  FaBell,
  FaEllipsisV,
  FaUser,
  FaUsers,
  FaHistory,
  FaCog,
} from "react-icons/fa";
import logo from "../../../assets/ARCOMLogo2.png";
import "./AdminNavigation.css";
import { useAuthStore } from "../../../store/useAuthStore.js";
import { useNavigate } from "react-router-dom";

function AdminNavigation({ activeSection, onSectionChange }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  return (
    <div className="admin-navigation-wrapper">
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
          <span className="profile-name">Admin</span>
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

        {/* Worker Management */}
        <div
          className={`nav-item ${activeSection === "worker-management" ? "active" : ""}`}
          onClick={() => onSectionChange("worker-management")}
        >
          <span className="nav-icon">
            <FaUsers />
          </span>
          <span className="nav-label">Worker Management</span>
        </div>

        {/* Activity Log */}
        <div
          className={`nav-item ${activeSection === "activity-log" ? "active" : ""}`}
          onClick={() => onSectionChange("activity-log")}
        >
          <span className="nav-icon">
            <FaHistory />
          </span>
          <span className="nav-label">Activity Log</span>
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

        <div
          className={`nav-item ${activeSection === "account-settings" ? "active" : ""}`}
          onClick={() => onSectionChange("account-settings")}
        >
          <span className="nav-icon">
            <FaCog />
          </span>
          <span className="nav-label">Account Settings</span>
        </div>
        <button className="log-out-button" onClick={handleLogout}>Log out</button>
      </nav>
    </div>
  );
}

export default AdminNavigation;
