import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaUsers,
  FaNetworkWired,
  FaBell,
  FaChevronRight,
  FaHistory,
  FaUserCog,
  FaCog,
} from "react-icons/fa";
import { useAuthStore } from "../../store/useAuthStore";
import {
  getFullName,
  getProfileInitials,
  getRoleName,
  getUserIdLabel,
  getUsernameLabel,
} from "../../utils/profileDisplay.js";
import logo from "../../assets/ARCOMLogo2.png";
import "./SuperAdminNavigation.css";

function SuperAdminNavigation({ activeSection, onSectionChange }) {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [isUsersExpanded, setIsUsersExpanded] = useState(() => {
    return localStorage.getItem("usersMenuExpanded") === "true";
  });

  useEffect(() => {
    localStorage.setItem("usersMenuExpanded", isUsersExpanded);
  }, [isUsersExpanded]);

  const toggleUsers = () => {
    setIsUsersExpanded(!isUsersExpanded);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("superAdminActiveSection");
    localStorage.removeItem("usersMenuExpanded");
    navigate("/home");
  };

  const fullName = getFullName(user);
  const roleName = getRoleName(user);
  const userIdLabel = getUserIdLabel(user);
  const usernameLabel = getUsernameLabel(user);
  const profileInitials = getProfileInitials(user);

  return (
    <div className="super-admin-navigation-wrapper">
      {/* User Profile Section */}
      <div className="logo-container">
        <img src={logo} alt="ARCOM Logo" className="logo" />
        <h1>RCOM</h1>
      </div>
      <div className="nav-profile">
        <div className="profile-avatar">
          <span className="profile-initials">{profileInitials}</span>
        </div>
        <div className="profile-info">
          <span className="profile-name">{fullName}</span>
          <span className="profile-role">{roleName}</span>
          {userIdLabel && <span className="profile-id">ID {userIdLabel}</span>}
          {usernameLabel && (
            <span className="profile-username">@{usernameLabel}</span>
          )}
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

        {/* Users Section with Submenu */}
        <div className="nav-item-group">
          <div
            className={`nav-item ${isUsersExpanded ? "expanded" : ""}`}
            onClick={toggleUsers}
          >
            <span className="nav-icon">
              <FaUsers />
            </span>
            <span className="nav-label">Users</span>
            <span className={`nav-arrow ${isUsersExpanded ? "open" : ""}`}>
              <FaChevronRight />
            </span>
          </div>

          {isUsersExpanded && (
            <div className="nav-submenu">
              <div
                className={`nav-subitem ${
                  activeSection === "user-management" ? "active" : ""
                }`}
                onClick={() => onSectionChange("user-management")}
              >
                <span className="nav-icon">
                  <FaUserCog />
                </span>
                <span className="nav-label">User Management</span>
              </div>

              <div
                className={`nav-subitem ${
                  activeSection === "activity-log" ? "active" : ""
                }`}
                onClick={() => onSectionChange("activity-log")}
              >
                <span className="nav-icon">
                  <FaHistory />
                </span>
                <span className="nav-label">Activity Log</span>
              </div>
            </div>
          )}
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
        <button className="log-out-button" onClick={handleLogout}>
          Log out
        </button>
      </nav>
    </div>
  );
}

export default SuperAdminNavigation;
