import "./WorkNodeDetails.css";

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
                {sensor.distance !== undefined
                  ? `${sensor.distance} cm`
                  : "N/A"}
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
              <span className="data-label">System Prediction/Insights:</span>
              <span className="data-value"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkNodeDetails;
