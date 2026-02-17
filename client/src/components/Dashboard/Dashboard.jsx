import React, { useState, useEffect } from "react";
import ActiveNodes from "./ActiveNodes.jsx";
import LastClogAlert from "./LastClogAlert.jsx";
import LiveAlertsFeed from "./LiveAlertsFeed.jsx";
import DataDisplay from "./DataDisplay.jsx";
import "./Dashboard.css";

function Dashboard() {
  const [latestData, setLatestData] = useState(null);

  useEffect(() => {
    fetchLatestData();
    const interval = setInterval(fetchLatestData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLatestData = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/data/latest");
      if (response.ok) {
        const data = await response.json();
        setLatestData(data);
      }
    } catch (error) {
      console.error("Error fetching latest data:", error);
    }
  };

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
      {latestData && <DataDisplay data={latestData} />}
      <div className="live-alerts-feed-container">
        <LiveAlertsFeed />
      </div>
    </div>
  );
}

export default Dashboard;
