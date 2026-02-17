import React from "react";
import "./Alerts.css";

function Alerts() {
  // Sample data structure - replace with actual data fetch later
  const sampleAlertData = [
    { id: 1, status: "unresolved" },
    { id: 2, status: "ongoing" },
    { id: 3, status: "resolved" },
  ];

  return (
    <div className="alerts-container-constraints">
      <div className="alerts-container">
        <div>
          <div className="UnresolvedSection">
            <p>Unresolved Alerts</p>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
          </div>
          <div className="OngoingSection">
            <p>Ongoing Alerts</p>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
          </div>
          <div className="ResolvedSection">
            <p>Resolved Alerts</p>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alerts;
