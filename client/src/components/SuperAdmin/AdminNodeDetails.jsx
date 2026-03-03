import "./AdminNodeDetails.css";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useState } from "react";

function AdminNodeDetails() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nodeLocation: "",
    macAddress: "",
  });

  // Sample sensor data
  const sensor = {
    timestamp: new Date().toISOString(),
    batteryPercent: 100,
    distance: 184,
    water_level: 186.13,
    flow_rate: 0.14,
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Adding node:", formData);
    // Add API call here
    setIsModalOpen(false);
    setFormData({
      nodeLocation: "",
      macAddress: "",
    });
  };

  return (
    <div className="admin-node-details-wrapper">
      <div className="admin-node-details-content">
        <div className="header-section">
          <h2 className="page-title">Node Details</h2>
          <button
            className="add-node-button"
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlus />
            Add Node
          </button>
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

      {/* Add Node Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Node</h2>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nodeLocation">Node Location</label>
                <input
                  type="text"
                  id="nodeLocation"
                  name="nodeLocation"
                  value={formData.nodeLocation}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="macAddress">MAC Address</label>
                <input
                  type="text"
                  id="macAddress"
                  name="macAddress"
                  value={formData.macAddress}
                  onChange={handleInputChange}
                  placeholder="XX:XX:XX:XX:XX:XX"
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNodeDetails;
