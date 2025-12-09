import React from "react";
import ActiveNodes from "./ActiveNodes.jsx";
import LastClogAlert from "./LastClogAlert.jsx";
import LiveAlertsFeed from "./LiveAlertsFeed.jsx";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="active-nodes-container">
          <ActiveNodes />
        </div>
        <div className="last-clog-alert-container">
          <LastClogAlert />
        </div>
      </div>
      <div className="live-alerts-feed-container">
        <LiveAlertsFeed />
      </div>
    </div>
  );
}

export default Dashboard;
