import "./WorkNodeDetails.css";
import { FaChartLine } from "react-icons/fa";

function WorkNodeDetails() {
  // Sample sensor data
  const sensor = {
    timestamp: new Date().toISOString(),
    batteryPercent: 100,
    distance: 184,
    water_level: 186.13,
    flow_rate: 0.14,
  };

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
              <button className="historical-trends-button">
                <FaChartLine />
                View Historical Trends
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkNodeDetails;
