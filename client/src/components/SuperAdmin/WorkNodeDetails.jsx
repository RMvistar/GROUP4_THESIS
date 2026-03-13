import "./WorkNodeDetails.css";
import { FaChartLine } from "react-icons/fa";
import { useState } from "react";
import HistoricalTrendsModal from "../HistoricalTrends/HistoricalTrendsModal";

function WorkNodeDetails() {
  const [isTrendsModalOpen, setIsTrendsModalOpen] = useState(false);

  // Sample sensor data
  const sensor = {
    timestamp: new Date().toISOString(),
    batteryPercent: 100,
    distance: 184,
    water_level: 186.13,
    flow_rate: 0.14,
  };

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

  return (
    <div className="work-node-details-wrapper">
      <div className="work-node-details-content">
        <div className="header-section">
          <h2 className="page-title">Node Details</h2>
        </div>
        <div className="nodeCard">
          <div className="card-header">
            <span className="status-badge">NORMAL</span>
            <span className="timestamp">
              {new Date(sensor.timestamp).toLocaleString()}
            </span>
          </div>
          <div className="card-body">
            {/* Primary Metrics Grid */}
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Node Location</span>
                <span className="metric-value">USLS</span>
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

            {/* System Insights Section */}
            <div className="insights-section">
              <h3 className="section-title">System Prediction & Insights</h3>
              <p className="insights-text">
                No prediction data available. Historical trends analysis can
                provide predictive insights.
              </p>
            </div>

            {/* Actions Section */}
            <div className="actions-section">
              <button
                className="historical-trends-button"
                onClick={() => setIsTrendsModalOpen(true)}
              >
                <FaChartLine />
                View Historical Trends
              </button>
            </div>
          </div>
        </div>
      </div>

      <HistoricalTrendsModal
        isOpen={isTrendsModalOpen}
        onClose={() => setIsTrendsModalOpen(false)}
        sensor={sensor}
        nodeLabel="USLS"
        events={historicalEvents}
        selectId="work-trend-view-select"
      />
    </div>
  );
}

export default WorkNodeDetails;
