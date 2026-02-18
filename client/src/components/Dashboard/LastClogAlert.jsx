import React from "react";
import { FaClock } from "react-icons/fa";
import "./LastClogAlert.css";

function LastClogAlert() {
  return (
    <div className="last-clog-alert">
      <div className="icon-container">
        <FaClock className="alert-icon" />
      </div>
      <h3 className="widget-title">Last Clog Alert</h3>
      <div className="alert-time">12:42</div>
      <div className="alert-period">PM</div>
      <div className="alert-location">Node A: B Segment</div>
    </div>
  );
}

export default LastClogAlert;
