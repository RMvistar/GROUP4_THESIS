import { useState, useEffect } from "react";
import "./PowerUserPage.css";
import PowerUserNavigation from "./PowerUserNavigation.jsx";
import WorkNodeDetails from "../WorkNodeDetails.jsx";
import AdminAlerts from "../../Alerts/AdminAlerts.jsx";
import ActivityLog from "../ActivityLog.jsx";
import WorkerManagement from "./WorkerManagement.jsx";
import WorkDashboard from "../WorkDashboard.jsx";
import AccountSettings from "../../AccountSettings/AccountSettings.jsx";

function PowerUserPage() {
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem("powerUserActiveSection") || "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("powerUserActiveSection", activeSection);
  }, [activeSection]);

  return (
    <div className="admin-page-wrapper">
      <PowerUserNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="admin-content">
        {activeSection === "dashboard" && <WorkDashboard />}
        {activeSection === "alerts" && <AdminAlerts />}
        {activeSection === "worker-management" && <WorkerManagement />}
        {activeSection === "activity-log" && <ActivityLog />}
        {activeSection === "node-details" && <WorkNodeDetails />}
        {activeSection === "account-settings" && <AccountSettings />}
      </div>
    </div>
  );
}

export default PowerUserPage;
