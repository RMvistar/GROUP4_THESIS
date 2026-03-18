import React from "react";
import "./DataDisplay.css";

// ML 5-state labels (from ml_state field)
const ML_STATE_CONFIG = {
  optimal: { label: "Optimal", color: "#4CAF50", icon: "✓" },
  warning: { label: "Warning", color: "#FFEB3B", icon: "⚠" },
  at_risk: { label: "At Risk", color: "#FF9800", icon: "⚠" },
  clogged: { label: "Clogged", color: "#F44336", icon: "⚠" },
  overflow: { label: "Overflow", color: "#9C27B0", icon: "⚠" },
};

// Fallback for non-ML data (ESP / legacy format)
const STATUS_CONFIG = {
  0: { label: "Optimal", color: "#4CAF50", icon: "✓" },
  1: { label: "At Risk", color: "#FF9800", icon: "⚠" },
  2: { label: "Clogged", color: "#F44336", icon: "⚠" },
  3: { label: "Overflow", color: "#9C27B0", icon: "⚠" },
};

function DataDisplay({ data }) {
  const statusInfo =
    (data.ml_state && ML_STATE_CONFIG[data.ml_state]) ||
    STATUS_CONFIG[data.status] ||
    STATUS_CONFIG[0];

  return (
    <div className="data-display-container">
      <h2>Current Drainage Status</h2>
      <div className="data-cards">
        <div
          className="data-card status-card"
          style={{ borderColor: statusInfo.color }}
        >
          <div className="card-icon" style={{ color: statusInfo.color }}>
            {statusInfo.icon}
          </div>
          <div className="card-content">
            <h3>Status</h3>
            <p className="value" style={{ color: statusInfo.color }}>
              {statusInfo.label}
            </p>
          </div>
        </div>

        <div className="data-card">
          <div className="card-icon">💧</div>
          <div className="card-content">
            <h3>Flow Rate</h3>
            <p className="value">
              {data.flow_rate?.toFixed(2)} <span>L/min</span>
            </p>
          </div>
        </div>

        <div className="data-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Water Level</h3>
            <p className="value">
              {data.water_level?.toFixed(2)} <span>cm</span>
            </p>
          </div>
        </div>
      </div>
      <div className="last-updated">
        Last updated:{" "}
        {new Date(data.timestamp || data.createdAt).toLocaleString()}
      </div>
    </div>
  );
}

export default DataDisplay;
