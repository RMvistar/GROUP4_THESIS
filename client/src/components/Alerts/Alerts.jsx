import React, { useState, useEffect } from "react";
import "./Alerts.css";

function Alerts() {
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

      const response = await fetch("http://localhost:5001/api/data/alerts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      setDataList(data); // Show data from public endpoint
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
    <div className="alerts-container-constraints">
      <div className="alerts-container">
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
                      <div className="card-location">
                        Node Location: {item.nodeLocation || "USLS"}
                      </div>
                      <div className="card-message">
                        {item.message ||
                          "Water overflow and clogging detected."}
                      </div>
                    </div>
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
                      <div className="card-location">
                        Node Location: {item.nodeLocation || "USLS"}
                      </div>
                      <div className="card-message">
                        {item.message ||
                          "Water overflow and clogging detected."}
                      </div>
                    </div>
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
                      <div className="card-location">
                        Node Location: {item.nodeLocation || "USLS"}
                      </div>
                      <div className="card-message">
                        {item.message ||
                          "Water overflow and clogging detected."}
                      </div>
                    </div>
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

export default Alerts;
