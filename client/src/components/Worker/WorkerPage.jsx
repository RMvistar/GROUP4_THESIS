import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./WorkerPage.css";
import WorkerNavigation from "./WorkerNavigation.jsx";
import WorkDashboard from "../SuperAdmin/WorkDashboard.jsx";
import WorkNodeDetails from "../SuperAdmin/WorkNodeDetails.jsx";
import WorkerAlerts from "../Alerts/WorkerAlerts.jsx";
import Tasks from "./Tasks.jsx";
import AccountSettings from "../AccountSettings/AccountSettings.jsx";

function WorkerPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Map section to path
  const sectionToPath = {
    dashboard: "/worker/dashboard",
    "node-details": "/worker/node-details",
    alerts: "/worker/alerts",
    tasks: "/worker/tasks",
    "account-settings": "/worker/account-settings",
  };

  // Map path to section
  const pathToSection = {
    "/worker/dashboard": "dashboard",
    "/worker/node-details": "node-details",
    "/worker/alerts": "alerts",
    "/worker/tasks": "tasks",
    "/worker/account-settings": "account-settings",
  };

  // Default section
  const defaultSection = "dashboard";
  const currentSection = pathToSection[location.pathname] || defaultSection;

  const handleSectionChange = (section) => {
    navigate(sectionToPath[section]);
  };

  return (
    <div className="worker-page-wrapper">
      <WorkerNavigation
        activeSection={currentSection}
        onSectionChange={handleSectionChange}
      />
      <div className="worker-content">
        <Routes>
          <Route path="dashboard" element={<WorkDashboard />} />
          <Route path="node-details" element={<WorkNodeDetails />} />
          <Route path="alerts" element={<WorkerAlerts />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="account-settings" element={<AccountSettings />} />
          <Route path="*" element={<WorkDashboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default WorkerPage;
