import React, { useCallback, useEffect, useState } from "react";
import "./LiveAlertsFeed.css";
import { ConfigProvider, Pagination, theme } from "antd";
import { io } from "socket.io-client";
import { getAlertCardContent } from "../../utils/alertPresentation";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const STATE_META = {
  overflow: { label: "Overflow", color: "#9C27B0" },
  clogged: { label: "Clogged", color: "#F44336" },
  at_risk: { label: "At Risk", color: "#FF9800" },
  warning: { label: "Warning", color: "#FFEB3B" },
  optimal: { label: "Optimal", color: "#4CAF50" },
};

const TASK_STATUS_META = {
  pending: { label: "Unresolved", color: "#f97316" },
  ongoing: { label: "Ongoing", color: "#38bdf8" },
  resolved: { label: "Resolved", color: "#22c55e" },
};

const OVERFLOW_COLOR = "#e11d48";
const MAX_FEED_ITEMS = 100;
const PAGE_SIZE = 8;

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

function getEntryTimestamp(entry) {
  return new Date(entry?.timestamp || 0).getTime();
}

function sortFeedEntries(entries) {
  return [...entries].sort((a, b) => getEntryTimestamp(b) - getEntryTimestamp(a));
}

function LiveAlertsFeed() {
  const [predictions, setPredictions] = useState([]);
  const [taskAlerts, setTaskAlerts] = useState([]);
  const [overflowAlerts, setOverflowAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const buildTaskFeedEntry = useCallback((taskData) => {
    if (!taskData?._id) return null;

    const normalizedTask = {
      ...taskData,
      node_id: taskData.node_id || { location: taskData.node_location },
    };
    const alertCard = getAlertCardContent(normalizedTask);
    const status = normalizedTask.status || "pending";
    const statusMeta = TASK_STATUS_META[status] || TASK_STATUS_META.pending;
    const timestamp =
      normalizedTask.timestamp ||
      normalizedTask.completed_date ||
      normalizedTask.created_date ||
      new Date().toISOString();

    return {
      id: normalizedTask.event_id || `${normalizedTask._id}-${status}-${timestamp}`,
      kind: "task",
      timestamp,
      title: alertCard.title,
      description: alertCard.description,
      location: normalizedTask.node_id?.location || "Unknown Node",
      statusLabel: statusMeta.label,
      statusColor: statusMeta.color,
    };
  }, []);

  const buildOverflowFeedEntry = useCallback((payload) => {
    if (!payload) return null;

    const timestamp = payload.timestamp || new Date().toISOString();
    const location = payload.node_location || "Unknown Node";

    return {
      id:
        payload.event_id ||
        `overflow-${payload.sensor_id || location}-${timestamp}`,
      kind: "overflow",
      timestamp,
      location,
      title: "Overflow",
      description:
        payload.message || `Overflow detected at ${location}.`,
      waterLevel: payload.water_level,
      flowRate: payload.flow_rate,
    };
  }, []);

  const buildPredictionFeedEntry = useCallback((record) => {
    if (!record?._id || !record?.ml_state) return null;

    return {
      id: `prediction-${record._id}`,
      kind: "prediction",
      timestamp: record.createdAt,
      record,
    };
  }, []);

  const fetchPredictions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/predictions?limit=50`);
      if (!res.ok) {
        throw new Error("Failed to fetch predictions");
      }

      const data = await res.json();
      const rawPredictions = Array.isArray(data) ? data : data.value || [];
      setPredictions(mergePredictions(rawPredictions).slice(0, MAX_FEED_ITEMS));
    } catch (err) {
      console.error("Error fetching predictions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTaskAlerts = useCallback(async () => {
    setTaskLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/public/alerts`);
      if (!res.ok) {
        throw new Error("Failed to fetch task alerts");
      }

      const data = await res.json();
      const entries = Array.isArray(data)
        ? data
            .map((task) =>
              buildTaskFeedEntry({
                ...task,
                timestamp: task.created_date,
              }),
            )
            .filter(Boolean)
        : [];

      setTaskAlerts(sortFeedEntries(entries).slice(0, MAX_FEED_ITEMS));
    } catch (err) {
      console.error("Error fetching task alerts:", err);
    } finally {
      setTaskLoading(false);
    }
  }, [buildTaskFeedEntry]);

  useEffect(() => {
    fetchPredictions();
    fetchTaskAlerts();

    const interval = setInterval(fetchPredictions, 10000);
    return () => clearInterval(interval);
  }, [fetchPredictions, fetchTaskAlerts]);

  useEffect(() => {
    const socket = io(API_BASE_URL, { transports: ["websocket"] });

    const handlePrediction = (data) => {
      if (!data?.ml_state) return;

      setPredictions((prev) =>
        upsertPrediction(prev, data).slice(0, MAX_FEED_ITEMS),
      );
      setCurrentPage(1);
    };

    const handleTaskUpdate = (payload) => {
      const entry = buildTaskFeedEntry(payload);
      if (!entry) return;

      setTaskAlerts((prev) =>
        sortFeedEntries([entry, ...prev]).slice(0, MAX_FEED_ITEMS),
      );
      setCurrentPage(1);
    };

    const handleOverflow = (payload) => {
      const entry = buildOverflowFeedEntry(payload);
      if (!entry) return;

      setOverflowAlerts((prev) =>
        sortFeedEntries([entry, ...prev]).slice(0, MAX_FEED_ITEMS),
      );
      setCurrentPage(1);
    };

    socket.on("new_prediction", handlePrediction);
    socket.on("task_update", handleTaskUpdate);
    socket.on("overflow_alert", handleOverflow);

    return () => {
      socket.off("new_prediction", handlePrediction);
      socket.off("task_update", handleTaskUpdate);
      socket.off("overflow_alert", handleOverflow);
      socket.disconnect();
    };
  }, [buildOverflowFeedEntry, buildTaskFeedEntry]);

  const combinedFeed = sortFeedEntries([
    ...taskAlerts,
    ...overflowAlerts,
    ...predictions
      .map((record) => buildPredictionFeedEntry(record))
      .filter(Boolean),
  ]).slice(0, MAX_FEED_ITEMS);

  const totalPages = Math.max(1, Math.ceil(combinedFeed.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const paginatedFeed = combinedFeed.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="live-alerts-feed">
      <div className="feed-header">
        <span className="live-indicator"></span>
        <h3 className="feed-title">Live Alerts Feed</h3>
      </div>

      <div className="feed-content">
        {(loading || taskLoading) && combinedFeed.length === 0 && (
          <p className="feed-section-empty">Loading alerts...</p>
        )}

        {!loading && !taskLoading && combinedFeed.length === 0 && (
          <p className="feed-section-empty">No live alerts yet.</p>
        )}

        {paginatedFeed.map((entry) => {
          if (entry.kind === "task") {
            return (
              <div key={entry.id} className="feed-alert-item feed-task-card">
                <div className="feed-alert-header">
                  <span
                    className="feed-alert-status"
                    style={{ backgroundColor: entry.statusColor }}
                  >
                    {entry.statusLabel}
                  </span>
                  <span className="feed-alert-location">{entry.location}</span>
                  <span className="feed-alert-time">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="feed-alert-body">
                  <strong>{entry.title}</strong>
                  <p>{entry.description}</p>
                </div>
              </div>
            );
          }

          if (entry.kind === "overflow") {
            return (
              <div key={entry.id} className="feed-alert-item feed-overflow-card">
                <div className="feed-alert-header">
                  <span
                    className="feed-alert-status"
                    style={{ backgroundColor: OVERFLOW_COLOR }}
                  >
                    Overflow
                  </span>
                  <span className="feed-alert-location">{entry.location}</span>
                  <span className="feed-alert-time">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="feed-alert-body">
                  <strong>{entry.title}</strong>
                  <p>{entry.description}</p>
                  {(entry.waterLevel != null || entry.flowRate != null) && (
                    <p>
                      {entry.waterLevel != null &&
                        `Water Level: ${entry.waterLevel} cm`}
                      {entry.waterLevel != null &&
                        entry.flowRate != null &&
                        " | "}
                      {entry.flowRate != null &&
                        `Flow: ${entry.flowRate} cm/s`}
                    </p>
                  )}
                </div>
              </div>
            );
          }

          const record = entry.record;
          const state = getStateMeta(record.ml_state);
          const eta = formatEta(record);

          return (
            <div key={entry.id} className="feed-alert-item">
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

        {combinedFeed.length > PAGE_SIZE && (
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
                total={combinedFeed.length}
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
