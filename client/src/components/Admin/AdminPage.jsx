import { useState, useEffect } from "react";
import "./AdminPage.css";
import AdminNavigation from "./AdminNavigation.jsx";
import UserManagement from "./UserManagement.jsx";
import ActivityLog from "./ActivityLog.jsx";
import AdminNodeDetails from "./AdminNodeDetails.jsx";
import AdminAlerts from "../Alerts/AdminAlerts.jsx";
import WorkDashboard from "./WorkDashboard.jsx";
import AccountSettings from "../AccountSettings/AccountSettings.jsx";

function AdminPage() {
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem("adminActiveSection") || "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("adminActiveSection", activeSection);
  }, [activeSection]);

  return (
    <div className="admin-page-wrapper">
      <AdminNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="admin-content">
        {activeSection === "dashboard" && <WorkDashboard />}
        {activeSection === "alerts" && <AdminAlerts />}
        {activeSection === "user-management" && <UserManagement />}

        {activeSection === "activity-log" && <ActivityLog />}
        {activeSection === "node-details" && <AdminNodeDetails />}
        {activeSection === "account-settings" && <AccountSettings />}
      </div>
    </div>
  );
}

export default AdminPage;
