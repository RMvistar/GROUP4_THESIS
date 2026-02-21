import React, { useEffect } from "react";
import { useDataStore } from "../../store/useDataStore";
import "./NodeContainer.css";

function NodeContainer() {
  const { data, loading, error, fetchPublicData } = useDataStore();

  useEffect(() => {
    fetchPublicData();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchPublicData, 5000);
    return () => clearInterval(interval);
  }, [fetchPublicData]);

  if (loading && data.length === 0) {
    return <div className="node-wrapper">Loading sensor data...</div>;
  }

  if (error) {
    return <div className="node-wrapper">Error: {error}</div>;
  }

  // Take first 4 sensors or create placeholders
  const displaySensors = [...data.slice(0, 4)];
  while (displaySensors.length < 4) {
    displaySensors.push(null);
  }

  const renderNodeCard = (sensor, nodeNumber) => {
    if (!sensor) {
      return (
        <div className="nodeCard">
          <div className="card-header">
            <span className="status-badge">NO DATA</span>
            <span className="timestamp">Waiting for data...</span>
          </div>
          <div className="card-body">
            <div className="data-row">
              <span className="data-label">Node {nodeNumber}:</span>
              <span className="data-value">Not connected</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="nodeCard">
        <div className="card-header">
          <span className="status-badge">NORMAL</span>
          <span className="timestamp">
            {new Date(sensor.timestamp).toLocaleString()}
          </span>
        </div>
        <div className="card-body">
          <div className="data-row">
            <span className="data-label">Node Location:</span>
            <span className="data-value">USLS</span>
          </div>
          <div className="data-row">
            <span className="data-label">Status:</span>
            <span className="data-value">Normal</span>
          </div>
          <div className="data-row">
            <span className="data-label">Battery:</span>
            <span className="data-value">
              {sensor.batteryPercent !== undefined
                ? `${sensor.batteryPercent}%`
                : "N/A"}
            </span>
          </div>
          <div className="data-row">
            <span className="data-label">Clog Status:</span>
            <span className="data-value">
              {sensor.distance !== undefined ? `${sensor.distance} cm` : "N/A"}
            </span>
          </div>
          <div className="data-row">
            <span className="data-label">Water Level:</span>
            <span className="data-value">
              {sensor.water_level !== undefined
                ? `${sensor.water_level.toFixed(2)} cm`
                : "N/A"}
            </span>
          </div>
          <div className="data-row">
            <span className="data-label">Water Flow:</span>
            <span className="data-value">
              {sensor.flow_rate !== undefined
                ? `${sensor.flow_rate} cm/s`
                : "N/A"}
            </span>
          </div>
          <div className="data-row">
            <span className="data-label">System Insights:</span>
            <span className="data-value"></span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="node-wrapper">
      <div className="node-container-1">
        <div className="node-1">{renderNodeCard(displaySensors[0], 1)}</div>
        <div className="node-2">{renderNodeCard(displaySensors[1], 2)}</div>
      </div>
      <div className="node-container-2">
        <div className="node-3">{renderNodeCard(displaySensors[2], 3)}</div>
        <div className="node-4">{renderNodeCard(displaySensors[3], 4)}</div>
      </div>
    </div>
  );
}

export default NodeContainer;
