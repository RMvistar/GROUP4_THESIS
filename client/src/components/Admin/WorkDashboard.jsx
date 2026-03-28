import React, { useState, useEffect } from "react";
import ActiveNodes from "../Dashboard/ActiveNodes.jsx";
import LastClogAlert from "../Dashboard/LastClogAlert.jsx";
import LiveAlertsFeed from "../Dashboard/LiveAlertsFeed.jsx";
import "./WorkDashboard.css";

function WorkDashboard() {
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
    <div className="work-dashboard-wrapper">
      <div className="work-dashboard-container">
        <div className="work-active-nodes-container">
          <ActiveNodes />
        </div>
        <div className="work-last-clog-alert-container">
          <LastClogAlert />
        </div>
        <div className="work-live-alerts-feed-container">
          <LiveAlertsFeed />
        </div>
      </div>
    </div>
  );
}

export default WorkDashboard;
