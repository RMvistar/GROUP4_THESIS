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
} from "react-icons/fa";
import "./SuperAdminNavigation.css";

function SuperAdminNavigation({ activeSection, onSectionChange }) {
  const [isUsersExpanded, setIsUsersExpanded] = useState(false);
  const [isManageExpanded, setIsManageExpanded] = useState(false);

  const toggleUsers = () => {
    setIsUsersExpanded(!isUsersExpanded);
  };

  const toggleManage = () => {
    setIsManageExpanded(!isManageExpanded);
  };

  return (
    <div className="super-admin-navigation-wrapper">
      {/* User Profile Section */}
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
                className={`nav-subitem ${isManageExpanded ? "expanded" : ""}`}
                onClick={toggleManage}
              >
                <span className="nav-label">Manage</span>
                <span className={`nav-arrow ${isManageExpanded ? "open" : ""}`}>
                  <FaChevronRight />
                </span>
              </div>

              {isManageExpanded && (
                <div className="nav-submenu-nested">
                  <div
                    className={`nav-subitem-nested ${
                      activeSection === "user-role" ? "active" : ""
                    }`}
                    onClick={() => onSectionChange("user-role")}
                  >
                    User Role
                  </div>
                  <div
                    className={`nav-subitem-nested ${
                      activeSection === "permissions" ? "active" : ""
                    }`}
                    onClick={() => onSectionChange("permissions")}
                  >
                    Permissions
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Projects */}
        <div
          className={`nav-item ${activeSection === "projects" ? "active" : ""}`}
          onClick={() => onSectionChange("projects")}
        >
          <span className="nav-icon">
            <FaNetworkWired />
          </span>
          <span className="nav-label">Node Details</span>
        </div>

        {/* Reports */}
        <div
          className={`nav-item ${activeSection === "reports" ? "active" : ""}`}
          onClick={() => onSectionChange("reports")}
        >
          <span className="nav-icon">
            <FaBell />
          </span>
          <span className="nav-label">Alerts</span>
        </div>

        {/* Settings */}
        <div
          className={`nav-item ${activeSection === "settings" ? "active" : ""}`}
          onClick={() => onSectionChange("settings")}
        >
          <span className="nav-icon">
            <FaCog />
          </span>
          <span className="nav-label">Settings</span>
        </div>
        <button className="log-out-button">Log out</button>
      </nav>
    </div>
  );
}

export default SuperAdminNavigation;
