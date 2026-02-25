import { useState } from "react";
import {
  FaChartLine,
  FaUsers,
  FaNetworkWired,
  FaBell,
  FaCog,
  FaChevronRight,
  FaEllipsisV,
  FaUser,
  FaUserShield,
  FaHistory,
  FaUserCog,
} from "react-icons/fa";
import logo from "../../assets/ARCOMLogo2.png";
import "./SuperAdminNavigation.css";

function SuperAdminNavigation({ activeSection, onSectionChange }) {
  const [isUsersExpanded, setIsUsersExpanded] = useState(false);

  const toggleUsers = () => {
    setIsUsersExpanded(!isUsersExpanded);
  };

  return (
    <div className="super-admin-navigation-wrapper">
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
          <span className="profile-name">Super Admin</span>
        </div>
        <button className="profile-menu-btn">
          <FaEllipsisV />
        </button>
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
                  activeSection === "roles-permissions" ? "active" : ""
                }`}
                onClick={() => onSectionChange("roles-permissions")}
              >
                <span className="nav-icon">
                  <FaUserShield />
                </span>
                <span className="nav-label">Roles & Permissions</span>
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
        <button className="log-out-button">Log out</button>
      </nav>
    </div>
  );
}

export default SuperAdminNavigation;
