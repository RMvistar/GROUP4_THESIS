import { useState } from "react";
import { FaChartLine } from "react-icons/fa";
import HistoricalTrendsModal from "../HistoricalTrends/HistoricalTrendsModal";
import "./NodeContainer.css";

function NodeContainer() {
  const [isTrendsModalOpen, setIsTrendsModalOpen] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);

  // Sample data for display (not fetching from API for now)
  const sampleSensors = [
    {
      timestamp: new Date().toISOString(),
      batteryPercent: 100,
      distance: 184,
      water_level: 186.13,
      flow_rate: 0.14,
      location: "USLS",
    },
  ];

  const historicalEvents = [
    { date: "2026-03-14", type: "clog" },
    { date: "2026-03-13", type: "overflow" },
    { date: "2026-03-13", type: "clog" },
    { date: "2026-03-12", type: "clog" },
    { date: "2026-03-12", type: "overflow" },
    { date: "2026-03-11", type: "overflow" },
    { date: "2026-03-10", type: "clog" },
    { date: "2026-03-09", type: "clog" },
    { date: "2026-03-08", type: "overflow" },
    { date: "2026-02-28", type: "clog" },
    { date: "2026-02-22", type: "overflow" },
    { date: "2026-02-12", type: "clog" },
    { date: "2026-01-20", type: "overflow" },
    { date: "2026-01-14", type: "clog" },
    { date: "2025-12-18", type: "clog" },
    { date: "2025-12-05", type: "overflow" },
    { date: "2025-11-21", type: "clog" },
    { date: "2025-11-10", type: "overflow" },
    { date: "2025-10-30", type: "clog" },
  ];

  const activeSensor = selectedSensor || sampleSensors[0];

  const displaySensors = sampleSensors;

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
          {/* Compact Metrics Grid */}
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Node Location</span>
              <span className="metric-value">{sensor.location || "USLS"}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Status</span>
              <span className="metric-value status-normal">Normal</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Battery</span>
              <span className="metric-value battery-value">
                {sensor.batteryPercent !== undefined
                  ? `${sensor.batteryPercent}%`
                  : "N/A"}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Clog Status</span>
              <span className="metric-value">
                {sensor.distance !== undefined
                  ? `${sensor.distance} cm`
                  : "N/A"}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Water Level</span>
              <span className="metric-value">
                {sensor.water_level !== undefined
                  ? `${sensor.water_level.toFixed(2)} cm`
                  : "N/A"}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Water Flow</span>
              <span className="metric-value">
                {sensor.flow_rate !== undefined
                  ? `${sensor.flow_rate} cm/s`
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Compact System Insights Section */}
          <div className="insights-section">
            <h3 className="section-title">System Insights</h3>
            <p className="insights-text">
              No prediction data available. View historical trends for analysis.
            </p>
          </div>

          {/* Actions Section */}
          <div className="actions-section">
            <button
              className="historical-trends-button"
              onClick={() => {
                setSelectedSensor(sensor);
                setIsTrendsModalOpen(true);
              }}
            >
              <FaChartLine />
              View Trends
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="node-wrapper">
      <div className="node-container-1">
        <div className="node-1">{renderNodeCard(displaySensors[0], 1)}</div>
      </div>

      <HistoricalTrendsModal
        isOpen={isTrendsModalOpen}
        onClose={() => setIsTrendsModalOpen(false)}
        sensor={activeSensor}
        nodeLabel={activeSensor?.location || "USLS"}
        events={historicalEvents}
        selectId="node-trend-view-select"
      />
    </div>
  );
}

export default NodeContainer;
