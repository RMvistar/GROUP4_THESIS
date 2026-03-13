import React, { useEffect, useState } from "react";
import "./LiveAlertsFeed.css";
import { ConfigProvider, Pagination, theme } from "antd";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const STATUS_LABEL = {
  pending: "Unresolved",
  ongoing: "Ongoing",
  resolved: "Resolved",
};
const STATUS_COLOR = {
  pending: "#e74c3c",
  ongoing: "#f39c12",
  resolved: "#2ecc71",
};
const PAGE_SIZE = 5;

function LiveAlertsFeed() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/alerts`);
        if (res.ok) {
          const data = await res.json();
          setAlerts(data);
        }
      } catch (err) {
        console.error("Error fetching alerts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(alerts.length / PAGE_SIZE));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [alerts.length, currentPage]);

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginatedAlerts = alerts.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="live-alerts-feed">
      <div className="feed-header">
        <span className="live-indicator"></span>
        <h3 className="feed-title">Live Alerts Feed</h3>
      </div>
      <div className="feed-content">
        {loading && (
          <p style={{ color: "#aaa", textAlign: "center" }}>
            Loading alerts...
          </p>
        )}
        {!loading && alerts.length === 0 && (
          <p style={{ color: "#aaa", textAlign: "center" }}>
            No alerts at this time.
          </p>
        )}
        {paginatedAlerts.map((alert) => (
          <div key={alert._id} className="feed-alert-item">
            <div className="feed-alert-header">
              <span
                className="feed-alert-status"
                style={{ backgroundColor: STATUS_COLOR[alert.status] }}
              >
                {STATUS_LABEL[alert.status] || alert.status}
              </span>
              <span className="feed-alert-location">
                {alert.node_id?.location || "Unknown Node"}
              </span>
              <span className="feed-alert-time">
                {new Date(alert.created_date).toLocaleString()}
              </span>
            </div>
            <div className="feed-alert-body">
              <strong>{alert.title}</strong>
              {alert.description && <p>{alert.description}</p>}
            </div>
          </div>
        ))}

        {!loading && alerts.length > 0 && (
          <div className="live-alerts-pagination-wrapper">
            <ConfigProvider
              theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                  colorPrimary: "#3b82f6",
                  colorBgContainer: "#0f1b2e",
                  colorText: "#e5e7eb",
                  colorBorder: "rgba(255, 255, 255, 0.15)",
                },
              }}
            >
              <Pagination
                current={currentPage}
                pageSize={PAGE_SIZE}
                total={alerts.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
                size="small"
              />
            </ConfigProvider>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveAlertsFeed;
