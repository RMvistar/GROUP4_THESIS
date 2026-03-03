import { useState, useEffect } from "react";
import "./AdminPage.css";
import AdminNavigation from "./AdminNavigation.jsx";
import Dashboard from "../../Dashboard/Dashboard.jsx";
import AdminNodeDetails from "../AdminNodeDetails.jsx";
import AdminAlerts from "../../Alerts/AdminAlerts.jsx";
import ActivityLog from "../ActivityLog.jsx";
import WorkerManagement from "./WorkerManagement.jsx";

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
        {activeSection === "dashboard" && <Dashboard />}
        {activeSection === "alerts" && <AdminAlerts />}
        {activeSection === "worker-management" && <WorkerManagement />}
        {activeSection === "activity-log" && <ActivityLog />}
        {activeSection === "node-details" && <AdminNodeDetails />}
      </div>
    </div>
  );
}

export default AdminPage;
