import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";

function AdminPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/data/export", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setDataList(data.slice(0, 20)); // Show last 20 entries
      setError(null);
    } catch (err) {
      setError("Failed to load data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = (dataId) => {
    // Mark as acknowledged (you can add backend logic later)
    setDataList((prevData) => prevData.filter((item) => item._id !== dataId));
    console.log("Acknowledged data:", dataId);
  };

  const updateAlertStatus = async (dataId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5001/api/data/alert-status/${dataId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ alertStatus: newStatus }),
        },
      );

      if (response.ok) {
        // Update local state
        setDataList((prevData) =>
          prevData.map((item) =>
            item._id === dataId ? { ...item, alertStatus: newStatus } : item,
          ),
        );
      }
    } catch (error) {
      console.error("Error updating alert status:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 0:
        return "Normal";
      case 1:
        return "Warning";
      case 2:
        return "Alert";
      case 3:
        return "Critical";
      default:
        return "Unknown";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 0:
        return "status-normal";
      case 1:
        return "status-warning";
      case 2:
        return "status-alert";
      case 3:
        return "status-critical";
      default:
        return "";
    }
  };

  return (
    <div className="admin-page">
      <div className="data-section">
        {loading && <p>Loading data...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && dataList.length === 0 && (
          <p className="no-data">No data available</p>
        )}

        {!loading && !error && (
          <div className="alerts-columns">
            {/* Unresolved Alerts */}
            <div className="alert-column">
              <h2 className="column-title">Unresolved Alerts</h2>
              <div className="cards-container">
                {dataList
                  .filter((item) => item.alertStatus === "unresolved")
                  .map((item) => (
                    <div
                      key={item._id}
                      className={`data-card ${getStatusClass(item.status)}`}
                    >
                      <div className="card-header">
                        <span className="status-badge">
                          {getStatusLabel(item.status)}
                        </span>
                        <span className="timestamp">
                          {new Date(
                            item.timestamp || item.createdAt,
                          ).toLocaleString()}
                        </span>
                      </div>

                      <div className="card-body">
                        <div className="data-row">
                          <span className="data-label">Flow Rate:</span>
                          <span className="data-value">
                            {item.flow_rate} L/min
                          </span>
                        </div>
                        <div className="data-row">
                          <span className="data-label">Water Level:</span>
                          <span className="data-value">
                            {item.water_level} cm
                          </span>
                        </div>
                        <div className="data-row">
                          <span className="data-label">Distance:</span>
                          <span className="data-value">{item.distance} cm</span>
                        </div>
                        <div className="data-row">
                          <span className="data-label">Rain:</span>
                          <span className="data-value">
                            {item.rain ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>

                      <button
                        className="acknowledge-button"
                        onClick={() => updateAlertStatus(item._id, "ongoing")}
                      >
                        Mark as Ongoing
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Ongoing Alerts */}
            <div className="alert-column">
              <h2 className="column-title">Ongoing Alerts</h2>
              <div className="cards-container">
                {dataList
                  .filter((item) => item.alertStatus === "ongoing")
                  .map((item) => (
                    <div
                      key={item._id}
                      className={`data-card ${getStatusClass(item.status)}`}
                    >
                      <div className="card-header">
                        <span className="status-badge">
                          {getStatusLabel(item.status)}
                        </span>
                        <span className="timestamp">
                          {new Date(
                            item.timestamp || item.createdAt,
                          ).toLocaleString()}
                        </span>
                      </div>

                      <div className="card-body">
                        <div className="data-row">
                          <span className="data-label">Flow Rate:</span>
                          <span className="data-value">
                            {item.flow_rate} L/min
                          </span>
                        </div>
                        <div className="data-row">
                          <span className="data-label">Water Level:</span>
                          <span className="data-value">
                            {item.water_level} cm
                          </span>
                        </div>
                        <div className="data-row">
                          <span className="data-label">Distance:</span>
                          <span className="data-value">{item.distance} cm</span>
                        </div>
                        <div className="data-row">
                          <span className="data-label">Rain:</span>
                          <span className="data-value">
                            {item.rain ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>

                      <button
                        className="acknowledge-button resolve-button"
                        onClick={() => updateAlertStatus(item._id, "resolved")}
                      >
                        Mark as Resolved
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Resolved Alerts */}
            <div className="alert-column">
              <h2 className="column-title">Resolved Alerts</h2>
              <div className="cards-container">
                {dataList
                  .filter((item) => item.alertStatus === "resolved")
                  .map((item) => (
                    <div
                      key={item._id}
                      className={`data-card ${getStatusClass(item.status)}`}
                    >
                      <div className="card-header">
                        <span className="status-badge">
                          {getStatusLabel(item.status)}
                        </span>
                        <span className="timestamp">
                          {new Date(
                            item.timestamp || item.createdAt,
                          ).toLocaleString()}
                        </span>
                      </div>

                      <div className="card-body">
                        <div className="data-row">
                          <span className="data-label">Flow Rate:</span>
                          <span className="data-value">
                            {item.flow_rate} L/min
                          </span>
                        </div>
                        <div className="data-row">
                          <span className="data-label">Water Level:</span>
                          <span className="data-value">
                            {item.water_level} cm
                          </span>
                        </div>
                        <div className="data-row">
                          <span className="data-label">Distance:</span>
                          <span className="data-value">{item.distance} cm</span>
                        </div>
                        <div className="data-row">
                          <span className="data-label">Rain:</span>
                          <span className="data-value">
                            {item.rain ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>

                      <button
                        className="acknowledge-button acknowledged"
                        onClick={() => handleAcknowledge(item._id)}
                      >
                        Acknowledge
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
