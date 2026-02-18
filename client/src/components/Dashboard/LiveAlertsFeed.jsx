import React from "react";
import "./LiveAlertsFeed.css";

function LiveAlertsFeed() {
  return (
    <div className="live-alerts-feed">
      <div className="feed-header">
        <span className="live-indicator"></span>
        <h3 className="feed-title">Live Alerts Feed</h3>
      </div>
      <div className="feed-content">{/* Alert items will go here */}</div>
    </div>
  );
}

export default LiveAlertsFeed;
