import { useState } from "react";
import "./SuperAdminPage.css";
import SuperAdminNavigation from "./SuperAdminNavigation.jsx";
import Dashboard from "../Dashboard/Dashboard.jsx";
import Alerts from "../Alerts/Alerts.jsx";
import UserManagement from "./UserManagement.jsx";
import RolesAndPermissions from "./RolesAndPermissions.jsx";
import ActivityLog from "./ActivityLog.jsx";
import AdminNodeDetails from "./AdminNodeDetails.jsx";

function SuperAdminPage() {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="super-admin-page-wrapper">
      <SuperAdminNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="super-admin-content">
        {activeSection === "dashboard" && <Dashboard />}
        {activeSection === "alerts" && <Alerts />}
        {activeSection === "user-management" && <UserManagement />}
        {activeSection === "roles-permissions" && <RolesAndPermissions />}
        {activeSection === "activity-log" && <ActivityLog />}
        {activeSection === "node-details" && <AdminNodeDetails />}
      </div>
    </div>
  );
}

export default SuperAdminPage;
