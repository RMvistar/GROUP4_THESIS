import { useCallback, useEffect, useMemo, useState } from "react";
import { FaChartLine } from "react-icons/fa";
import HistoricalTrendsModal from "../HistoricalTrends/HistoricalTrendsModal";
import { buildHistoricalTrendEvents } from "../../utils/historicalTrendEvents";
import "./NodeContainer.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const STATUS_LABEL = {
  0: "Optimal",
  1: "At Risk",
  2: "Clogged",
  3: "Overflow",
};

function getStatusTone(node) {
  const mlState = node?.ml_state;
  if (mlState === "overflow") return "overflow";
  if (mlState === "clogged") return "clogged";
  if (mlState === "at_risk" || mlState === "warning") return "risk";

  const status = node?.status;
  if (status === 3) return "overflow";
  if (status === 2) return "clogged";
  if (status === 1) return "risk";
  if (!node) return "muted";
  return "optimal";
}

function getStatusLabel(node) {
  if (!node) return "No Data";
  if (node.ml_state) {
    return node.ml_state
      .replace(/_/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  return STATUS_LABEL[node.status] || "Unknown";
}

function getConnectivityLabel(node) {
  return node?.is_online ? "Online" : "Offline";
}

function NodeContainer({ className = "" }) {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendsState, setTrendsState] = useState({
    open: false,
    node: null,
    events: [],
  });

  const fetchNodeData = useCallback(async () => {
    try {
      const alertsRes = await fetch(`${API_BASE_URL}/api/public/alerts`);
      const nodesRes = await fetch(`${API_BASE_URL}/api/public/nodes`);
      if (!nodesRes.ok) throw new Error("Failed to fetch nodes");
      if (!alertsRes.ok) throw new Error("Failed to fetch alerts");

      const nodeList = await nodesRes.json();
      const alerts = await alertsRes.json();

      if (!Array.isArray(nodeList) || nodeList.length === 0) {
        setNodes([]);
        return;
      }

      const enrichedNodes = await Promise.all(
        nodeList.map(async (nodeSummary) => {
          const [detailsRes, historyRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/public/nodes/${nodeSummary.node_id}`),
            fetch(
              `${API_BASE_URL}/api/public/nodes/${nodeSummary.node_id}/history?limit=100`,
            ),
          ]);

          const details = detailsRes.ok
            ? await detailsRes.json()
            : {
                node_id: nodeSummary.node_id,
                location: nodeSummary.location,
                description: nodeSummary.description,
                last_update: null,
              };

          const history = historyRes.ok ? await historyRes.json() : null;
          const historicalEvents = buildHistoricalTrendEvents({
            node: details,
            historyEvents: history?.historical_events || [],
            alerts: Array.isArray(alerts) ? alerts : [],
          });

          return {
            ...details,
            historicalEvents,
          };
        }),
      );

      setNodes(enrichedNodes);
    } catch (err) {
      console.error("Error fetching node details:", err);
      setNodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNodeData();
    const interval = setInterval(fetchNodeData, 10000);
    return () => clearInterval(interval);
  }, [fetchNodeData]);

  const renderedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      statusLabel: getStatusLabel(node),
      statusTone: getStatusTone(node),
    }));
  }, [nodes]);

  const renderNodeCard = (node) => {
    if (!node) {
      return (
        <div className="node-shell">
          <div className="nodeCard">
            <div className="card-header">
              <span className="node-status-badge node-status-muted">NO DATA</span>
              <span className="timestamp">Waiting for data...</span>
            </div>
            <div className="card-body">
              <div className="empty-card-message">
                No connected nodes are available right now.
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={node.node_id} className="node-shell">
        <div className="nodeCard">
            <div className="card-header">
            <div className="node-header-badges">
              <span
                className={`node-status-badge node-status-${node.statusTone}`}
              >
                {node.statusLabel.toUpperCase()}
              </span>
              <span
                className={`node-status-badge node-connectivity-badge node-connectivity-${node.is_online ? "online" : "offline"}`}
              >
                {getConnectivityLabel(node).toUpperCase()}
              </span>
            </div>
            <span className="timestamp">
              {node.last_update
                ? new Date(node.last_update).toLocaleString()
                : "No timestamp"}
            </span>
          </div>
          <div className="card-body">
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Node Location</span>
                <span className="metric-value">{node.location || "N/A"}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Node ID</span>
                <span className="metric-value">{node.node_id || "N/A"}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Status</span>
                <span
                  className={`metric-value node-metric-status node-metric-status-${node.statusTone}`}
                >
                  {node.statusLabel}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Connection</span>
                <span
                  className={`metric-value node-metric-status node-metric-status-${node.is_online ? "optimal" : "offline"}`}
                >
                  {getConnectivityLabel(node)}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Battery</span>
                <span className="metric-value battery-value">
                  {node.batteryPercent !== undefined &&
                  node.batteryPercent !== null
                    ? `${node.batteryPercent}%`
                    : "N/A"}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Clog Status</span>
                <span className="metric-value">
                  {node.distance !== undefined && node.distance !== null
                    ? `${node.distance} cm`
                    : "N/A"}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Water Level</span>
                <span className="metric-value">
                  {node.water_level !== undefined && node.water_level !== null
                    ? `${node.water_level.toFixed(2)} cm`
                    : "N/A"}
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Water Flow</span>
                <span className="metric-value">
                  {node.flow_rate !== undefined && node.flow_rate !== null
                    ? `${node.flow_rate} cm/s`
                    : "N/A"}
                </span>
              </div>
            </div>

            <div className="insights-section">
              <h3 className="section-title">System Prediction & Insights</h3>
              <p className="insights-text">
                {!node.is_online
                  ? "This node is currently offline. It will switch back to online once fresh sensor data is received."
                  : node.ml_state
                    ? `ML state: ${node.statusLabel}. Real-time values are from live sensor data.`
                    : "No ML prediction on the latest sample. View historical trends for analysis."}
              </p>
            </div>

            <div className="actions-section">
              <button
                className="historical-trends-button"
                onClick={() =>
                  setTrendsState({
                    open: true,
                    node,
                    events: node.historicalEvents || [],
                  })
                }
              >
                <FaChartLine />
                View Trends
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`node-wrapper ${className}`.trim()}>
      <div className="node-list">
        {loading && nodes.length === 0 ? (
          <div className="node-shell">
              <div className="nodeCard">
              <div className="card-header">
                <span className="node-status-badge node-status-muted">LOADING</span>
                <span className="timestamp">Fetching latest sensor data...</span>
              </div>
            </div>
          </div>
        ) : renderedNodes.length === 0 ? (
          renderNodeCard(null)
        ) : (
          renderedNodes.map(renderNodeCard)
        )}
      </div>

      <HistoricalTrendsModal
        isOpen={trendsState.open}
        onClose={() =>
          setTrendsState({
            open: false,
            node: null,
            events: [],
          })
        }
        sensor={trendsState.node}
        nodeLabel={trendsState.node?.location || "N/A"}
        events={trendsState.events}
        selectId="node-trend-view-select"
      />
    </div>
  );
}

export default NodeContainer;
