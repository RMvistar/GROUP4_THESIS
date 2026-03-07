import { useState, useEffect } from "react";
import "./SuperAdminPage.css";
import SuperAdminNavigation from "./SuperAdminNavigation.jsx";
import UserManagement from "./UserManagement.jsx";
import RolesAndPermissions from "./RolesAndPermissions.jsx";
import ActivityLog from "./ActivityLog.jsx";
import AdminNodeDetails from "./AdminNodeDetails.jsx";
import AdminAlerts from "../Alerts/AdminAlerts.jsx";
import WorkDashboard from "./WorkDashboard.jsx";

function SuperAdminPage() {
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem("superAdminActiveSection") || "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("superAdminActiveSection", activeSection);
  }, [activeSection]);

  return (
    <div className="super-admin-page-wrapper">
      <SuperAdminNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="super-admin-content">
        {activeSection === "dashboard" && <WorkDashboard />}
        {activeSection === "alerts" && <AdminAlerts />}
        {activeSection === "user-management" && <UserManagement />}
        {activeSection === "roles-permissions" && <RolesAndPermissions />}
        {activeSection === "activity-log" && <ActivityLog />}
        {activeSection === "node-details" && <AdminNodeDetails />}
      </div>
    </div>
  );
}

export default SuperAdminPage;
