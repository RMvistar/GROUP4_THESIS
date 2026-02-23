import { useState } from "react";
import "./SuperAdminPage.css";
import SuperAdminNavigation from "./SuperAdminNavigation.jsx";

function SuperAdminPage() {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="super-admin-page-wrapper">
      <SuperAdminNavigation
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="super-admin-content">
        <h1>Super Admin Dashboard</h1>
        <p>Active Section: {activeSection}</p>
      </div>
    </div>
  );
}

export default SuperAdminPage;
