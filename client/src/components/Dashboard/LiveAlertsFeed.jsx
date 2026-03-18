import React, { useEffect, useRef, useState } from "react";
import "./LiveAlertsFeed.css";
import { ConfigProvider, Pagination, theme } from "antd";
import { io } from "socket.io-client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const STATE_META = {
  overflow: { label: "Overflow", color: "#9C27B0" },
  clogged: { label: "Clogged", color: "#F44336" },
  at_risk: { label: "At Risk", color: "#FF9800" },
  warning: { label: "Warning", color: "#FFEB3B" },
  optimal: { label: "Optimal", color: "#4CAF50" },
};

function getStateMeta(mlState) {
  return (
    STATE_META[mlState] || { label: mlState || "Unknown", color: "#90A4AE" }
  );
}

function formatEta(record) {
  if (
    record.ml_state === "at_risk" &&
    record.estimated_time_to_overflow_min != null
  ) {
    return `~${record.estimated_time_to_overflow_min.toFixed(1)} min to overflow`;
  }
  if (
    record.ml_state === "warning" &&
    record.estimated_time_to_at_risk_min != null
  ) {
    return `~${record.estimated_time_to_at_risk_min.toFixed(1)} min to at-risk`;
  }
  if (record.ml_state === "overflow") {
    return "Overflow in progress";
  }
  return null;
}

function predictionKey(record) {
  return `${record.sensor_id || "Sensor"}::${record.ml_state || "unknown"}`;
}

function sortByNewest(records) {
  return [...records].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

function mergePredictions(records) {
  const mergedMap = new Map();
  for (const record of records) {
    if (!record?.ml_state) continue;
    const key = predictionKey(record);
    const existing = mergedMap.get(key);
    if (!existing) {
      mergedMap.set(key, record);
      continue;
    }
    const existingTime = new Date(existing.createdAt || 0).getTime();
    const currentTime = new Date(record.createdAt || 0).getTime();
    if (currentTime >= existingTime) {
      mergedMap.set(key, record);
    }
  }
  return sortByNewest(Array.from(mergedMap.values()));
}

function upsertPrediction(existing, incoming) {
  if (!incoming?.ml_state) {
    return existing;
  }

  const key = predictionKey(incoming);
  const index = existing.findIndex((item) => predictionKey(item) === key);
  if (index === -1) {
    return sortByNewest([incoming, ...existing]);
  }

  const updated = [...existing];
  updated[index] = incoming;
  return sortByNewest(updated);
}

const PAGE_SIZE = 5;

function LiveAlertsFeed() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/public/predictions?limit=50`,
        );
        if (res.ok) {
          const data = await res.json();
          const rawPredictions = Array.isArray(data) ? data : data.value || [];
          setPredictions(mergePredictions(rawPredictions));
        }
      } catch (err) {
        console.error("Error fetching predictions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
    const interval = setInterval(fetchPredictions, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socketRef.current = io(API_BASE_URL, { transports: ["websocket"] });
    socketRef.current.on("new_prediction", (data) => {
      if (data && data.ml_state) {
        setPredictions((prev) => upsertPrediction(prev, data).slice(0, 100));
        setCurrentPage(1);
      }
    });
    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(predictions.length / PAGE_SIZE));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [predictions.length, currentPage]);

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginatedPredictions = predictions.slice(
    pageStart,
    pageStart + PAGE_SIZE,
  );

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
        {!loading && predictions.length === 0 && (
          <p style={{ color: "#aaa", textAlign: "center" }}>
            No predictions yet.
          </p>
        )}
        {paginatedPredictions.map((record) => {
          const state = getStateMeta(record.ml_state);
          const eta = formatEta(record);
          return (
            <div key={record._id} className="feed-alert-item">
              <div className="feed-alert-header">
                <span
                  className="feed-alert-status"
                  style={{
                    backgroundColor: state.color,
                    color: record.ml_state === "warning" ? "#000" : "#fff",
                  }}
                >
                  {state.label}
                </span>
                <span className="feed-alert-location">
                  {record.sensor_id || "Sensor"}
                </span>
                <span className="feed-alert-time">
                  {new Date(record.createdAt).toLocaleString()}
                </span>
              </div>
              {eta && (
                <div className="feed-alert-body">
                  <p>{eta}</p>
                </div>
              )}
            </div>
          );
        })}

        {!loading && predictions.length > 0 && (
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
                total={predictions.length}
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
