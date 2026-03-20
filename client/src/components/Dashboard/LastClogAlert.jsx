import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaClock } from "react-icons/fa";
import { io } from "socket.io-client";
import { getAlertCardContent } from "../../utils/alertPresentation";
import "./LastClogAlert.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

function buildClogAlertEntry(task) {
  if (!task) return null;

  const normalizedTask = {
    ...task,
    node_id: task.node_id || { location: task.node_location },
  };
  const alertCard = getAlertCardContent(normalizedTask);

  if (alertCard.title !== "Clog") {
    return null;
  }

  return {
    id: task.event_id || task._id,
    location: normalizedTask.node_id?.location || "Unknown Node",
    label: alertCard.title,
    description: alertCard.description,
    timestamp:
      task.timestamp ||
      task.completed_date ||
      task.created_date ||
      task.updatedAt ||
      null,
  };
}

function predictionKey(record) {
  return `${record.sensor_id || "Sensor"}::${record.ml_state || "unknown"}`;
}

function sortPredictionsByNewest(records) {
  return [...records].sort((a, b) => {
    const firstTime = new Date(a.createdAt || 0).getTime();
    const secondTime = new Date(b.createdAt || 0).getTime();
    return secondTime - firstTime;
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

  return sortPredictionsByNewest(Array.from(mergedMap.values()));
}

function buildClogPredictionEntry(record) {
  if (!record) return null;

  const isClogPrediction = record.ml_state === "clogged" || record.status === 2;
  if (!isClogPrediction) return null;

  return {
    id: `prediction-${record._id}`,
    location: record.sensor_id || "Unknown Sensor",
    label: "Clogged",
    description: "Clog condition detected from the live alerts feed.",
    timestamp: record.createdAt || null,
  };
}

function pickLatestClogEntry(entries) {
  return entries
    .filter(Boolean)
    .sort(
      (firstEntry, secondEntry) =>
        new Date(secondEntry.timestamp || 0).getTime() -
        new Date(firstEntry.timestamp || 0).getTime(),
    )[0] || null;
}

function LastClogAlert() {
  const [lastClogAlert, setLastClogAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLastClogAlert = useCallback(async () => {
    try {
      setLoading(true);
      const [alertsResponse, predictionsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/public/alerts`),
        fetch(`${API_BASE_URL}/api/public/predictions?limit=50`),
      ]);

      if (!alertsResponse.ok || !predictionsResponse.ok) {
        throw new Error("Failed to fetch live alert sources");
      }

      const [alerts, predictionsPayload] = await Promise.all([
        alertsResponse.json(),
        predictionsResponse.json(),
      ]);

      const predictions = Array.isArray(predictionsPayload)
        ? predictionsPayload
        : predictionsPayload.value || [];

      const latestClog = pickLatestClogEntry([
        ...(Array.isArray(alerts) ? alerts.map(buildClogAlertEntry) : []),
        ...mergePredictions(predictions).map(buildClogPredictionEntry),
      ]);

      setLastClogAlert(latestClog);
    } catch (error) {
      console.error("Error fetching last clog alert:", error);
      setLastClogAlert(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLastClogAlert();
  }, [fetchLastClogAlert]);

  useEffect(() => {
    const socket = io(API_BASE_URL, { transports: ["websocket"] });

    const handleTaskUpdate = (payload) => {
      const clogAlert = buildClogAlertEntry(payload);
      if (!clogAlert) return;

      setLastClogAlert((currentAlert) => {
        return pickLatestClogEntry([currentAlert, clogAlert]);
      });
    };

    const handlePrediction = (payload) => {
      const clogAlert = buildClogPredictionEntry(payload);
      if (!clogAlert) return;

      setLastClogAlert((currentAlert) => {
        return pickLatestClogEntry([currentAlert, clogAlert]);
      });
    };

    socket.on("task_update", handleTaskUpdate);
    socket.on("new_prediction", handlePrediction);

    return () => {
      socket.off("task_update", handleTaskUpdate);
      socket.off("new_prediction", handlePrediction);
      socket.disconnect();
    };
  }, []);

  const displayTime = useMemo(() => {
    if (!lastClogAlert?.timestamp) {
      return { time: "--:--", period: "" };
    }

    const date = new Date(lastClogAlert.timestamp);
    const parts = new Intl.DateTimeFormat([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).formatToParts(date);

    return {
      time: parts
        .filter((part) => part.type === "hour" || part.type === "literal" || part.type === "minute")
        .map((part) => part.value)
        .join("")
        .trim(),
      period: parts.find((part) => part.type === "dayPeriod")?.value || "",
    };
  }, [lastClogAlert]);

  const displayDate = useMemo(() => {
    if (!lastClogAlert?.timestamp) return "No clog alerts yet";

    return new Date(lastClogAlert.timestamp).toLocaleString();
  }, [lastClogAlert]);

  return (
    <div className="last-clog-alert">
      <div className="icon-container">
        <FaClock className="alert-icon" />
      </div>
      <h3 className="widget-title">Last Clog Alert</h3>
      {loading ? (
        <div className="alert-empty-state">Loading latest clog alert...</div>
      ) : (
        <>
          <div className="alert-time">{displayTime.time}</div>
          <div className="alert-period">{displayTime.period}</div>
          <div className="alert-location">
            {lastClogAlert?.location || "No clog alerts yet"}
          </div>
          <div className="alert-datetime">{displayDate}</div>
        </>
      )}
    </div>
  );
}

export default LastClogAlert;
