import { useState, useEffect } from "react";
import "./WorkerPage.css";
import WorkerNavigation from "./WorkerNavigation.jsx";
import WorkDashboard from "../SuperAdmin/WorkDashboard.jsx";
import WorkNodeDetails from "../SuperAdmin/WorkNodeDetails.jsx";
import WorkerAlerts from "./WorkerAlerts.jsx";

function WorkerPage() {
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem("workerActiveSection") || "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("workerActiveSection", activeSection);
  }, [activeSection]);

  return (
    <div className="worker-page-wrapper">
      <WorkerNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="worker-content">
        {activeSection === "dashboard" && <WorkDashboard />}
        {activeSection === "node-details" && <WorkNodeDetails />}
        {activeSection === "alerts" && <WorkerAlerts />}
        {/* Tasks section to be implemented later */}
        {activeSection === "tasks" && <div>Tasks Component Coming Soon</div>}
      </div>
    </div>
  );
}

export default WorkerPage;
