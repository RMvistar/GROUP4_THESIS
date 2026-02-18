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

  // Pagination state for each column
  const [unresolvedPage, setUnresolvedPage] = useState(1);
  const [ongoingPage, setOngoingPage] = useState(1);
  const [resolvedPage, setResolvedPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
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
      setDataList(data); // Show all fetched entries (backend limits to 50)
      setError(null);
    } catch (err) {
      setError("Failed to load data");
      console.error("Error fetching data:", err);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
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

  // Pagination helper function
  const paginateData = (data, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const getTotalPages = (dataLength) => {
    return Math.ceil(dataLength / itemsPerPage);
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
                {paginateData(
                  dataList.filter((item) => item.alertStatus === "unresolved"),
                  unresolvedPage,
                ).map((item) => (
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
                        <span className="data-label">Node Location:</span>
                        <span className="data-value"></span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Description:</span>
                        <span className="data-value"></span>
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
              {getTotalPages(
                dataList.filter((item) => item.alertStatus === "unresolved")
                  .length,
              ) > 1 && (
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() =>
                      setUnresolvedPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={unresolvedPage === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {unresolvedPage} of{" "}
                    {getTotalPages(
                      dataList.filter(
                        (item) => item.alertStatus === "unresolved",
                      ).length,
                    )}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() =>
                      setUnresolvedPage((prev) =>
                        Math.min(
                          prev + 1,
                          getTotalPages(
                            dataList.filter(
                              (item) => item.alertStatus === "unresolved",
                            ).length,
                          ),
                        ),
                      )
                    }
                    disabled={
                      unresolvedPage ===
                      getTotalPages(
                        dataList.filter(
                          (item) => item.alertStatus === "unresolved",
                        ).length,
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Ongoing Alerts */}
            <div className="alert-column">
              <h2 className="column-title">Ongoing Alerts</h2>
              <div className="cards-container">
                {paginateData(
                  dataList.filter((item) => item.alertStatus === "ongoing"),
                  ongoingPage,
                ).map((item) => (
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
                        <span className="data-label">Node Location:</span>
                        <span className="data-value"></span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Description</span>
                        <span className="data-value"></span>
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
              {getTotalPages(
                dataList.filter((item) => item.alertStatus === "ongoing")
                  .length,
              ) > 1 && (
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() =>
                      setOngoingPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={ongoingPage === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {ongoingPage} of{" "}
                    {getTotalPages(
                      dataList.filter((item) => item.alertStatus === "ongoing")
                        .length,
                    )}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() =>
                      setOngoingPage((prev) =>
                        Math.min(
                          prev + 1,
                          getTotalPages(
                            dataList.filter(
                              (item) => item.alertStatus === "ongoing",
                            ).length,
                          ),
                        ),
                      )
                    }
                    disabled={
                      ongoingPage ===
                      getTotalPages(
                        dataList.filter(
                          (item) => item.alertStatus === "ongoing",
                        ).length,
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Resolved Alerts */}
            <div className="alert-column">
              <h2 className="column-title">Resolved Alerts</h2>
              <div className="cards-container">
                {paginateData(
                  dataList.filter((item) => item.alertStatus === "resolved"),
                  resolvedPage,
                ).map((item) => (
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
                        <span className="data-label">
                          Node Location: SM Drainage B
                        </span>
                        <span className="data-value"></span>
                      </div>
                      <div className="data-row">
                        <span className="data-label">
                          <p>Water overflow and clogging detected.</p>
                        </span>
                        <span className="data-value"></span>
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
              {getTotalPages(
                dataList.filter((item) => item.alertStatus === "resolved")
                  .length,
              ) > 1 && (
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() =>
                      setResolvedPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={resolvedPage === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {resolvedPage} of{" "}
                    {getTotalPages(
                      dataList.filter((item) => item.alertStatus === "resolved")
                        .length,
                    )}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() =>
                      setResolvedPage((prev) =>
                        Math.min(
                          prev + 1,
                          getTotalPages(
                            dataList.filter(
                              (item) => item.alertStatus === "resolved",
                            ).length,
                          ),
                        ),
                      )
                    }
                    disabled={
                      resolvedPage ===
                      getTotalPages(
                        dataList.filter(
                          (item) => item.alertStatus === "resolved",
                        ).length,
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
