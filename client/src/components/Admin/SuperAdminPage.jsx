import { useState } from "react";
import "./SuperAdminPage.css";
import SuperAdminNavigation from "./SuperAdminNavigation.jsx";
import Dashboard from "../Dashboard/Dashboard.jsx";
import NodeDetails from "../NodeDetails/NodeDetails.jsx";
import Alerts from "../Alerts/Alerts.jsx";
import UserManagement from "./UserManagement.jsx";
import RolesAndPermissions from "./RolesAndPermissions.jsx";
import ActivityLog from "./ActivityLog.jsx";

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
        {activeSection === "node-details" && <NodeDetails />}
        {activeSection === "alerts" && <Alerts />}
        {activeSection === "user-management" && <UserManagement />}
        {activeSection === "roles-permissions" && <RolesAndPermissions />}
        {activeSection === "activity-log" && <ActivityLog />}
      </div>
    </div>
  );
}

export default SuperAdminPage;
