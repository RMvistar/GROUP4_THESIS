import { useEffect, useMemo, useState } from "react";
import { FaChartLine } from "react-icons/fa";
import HistoricalTrendsModal from "../HistoricalTrends/HistoricalTrendsModal";
import "./NodeContainer.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const STATUS_LABEL = {
  0: "Optimal",
  1: "At Risk",
  2: "Clogged",
  3: "Overflow",
};

function NodeContainer() {
  const [isTrendsModalOpen, setIsTrendsModalOpen] = useState(false);
  const [nodeDetails, setNodeDetails] = useState(null);
  const [historicalEvents, setHistoricalEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNodeData = async () => {
      try {
        const nodesRes = await fetch(`${API_BASE_URL}/api/public/nodes`);
        if (!nodesRes.ok) throw new Error("Failed to fetch nodes");
        const nodes = await nodesRes.json();

        if (!Array.isArray(nodes) || nodes.length === 0) {
          setNodeDetails(null);
          setHistoricalEvents([]);
          return;
        }

        const firstNodeId = nodes[0].node_id;
        const [detailsRes, historyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/public/nodes/${firstNodeId}`),
          fetch(
            `${API_BASE_URL}/api/public/nodes/${firstNodeId}/history?limit=100`,
          ),
        ]);

        if (detailsRes.ok) {
          const details = await detailsRes.json();
          setNodeDetails(details);
        }

        if (historyRes.ok) {
          const history = await historyRes.json();
          const mappedEvents = (history.historical_events || []).map((e) => ({
            date: new Date(e.timestamp).toISOString().slice(0, 10),
            type: (e.event_type || "").toLowerCase(),
          }));
          setHistoricalEvents(mappedEvents);
        }
      } catch (err) {
        console.error("Error fetching node details:", err);
        setNodeDetails(null);
        setHistoricalEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNodeData();
    const interval = setInterval(fetchNodeData, 10000);
    return () => clearInterval(interval);
  }, []);

  const statusLabel = useMemo(() => {
    if (!nodeDetails) return "No Data";
    if (nodeDetails.ml_state) {
      return nodeDetails.ml_state
        .replace(/_/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase());
    }
    return STATUS_LABEL[nodeDetails.status] || "Unknown";
  }, [nodeDetails]);

  const renderNodeCard = (sensor) => {
    if (loading) {
      return (
        <div className="nodeCard">
          <div className="card-header">
            <span className="status-badge">LOADING</span>
            <span className="timestamp">Fetching latest sensor data...</span>
          </div>
        </div>
      );
    }

    if (!sensor) {
      return (
        <div className="nodeCard">
          <div className="card-header">
            <span className="status-badge">NO DATA</span>
            <span className="timestamp">Waiting for data...</span>
          </div>
          <div className="card-body">
            <div className="data-row">
              <span className="data-label">Node:</span>
              <span className="data-value">Not connected</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="nodeCard">
        <div className="card-header">
          <span className="status-badge">{statusLabel.toUpperCase()}</span>
          <span className="timestamp">
            {sensor.last_update
              ? new Date(sensor.last_update).toLocaleString()
              : "No timestamp"}
          </span>
        </div>
        <div className="card-body">
          {/* Compact Metrics Grid */}
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Node Location</span>
              <span className="metric-value">{sensor.location || "N/A"}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Status</span>
              <span className="metric-value status-normal">{statusLabel}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Battery</span>
              <span className="metric-value battery-value">
                {sensor.batteryPercent !== undefined &&
                sensor.batteryPercent !== null
                  ? `${sensor.batteryPercent}%`
                  : "N/A"}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Clog Status</span>
              <span className="metric-value">
                {sensor.distance !== undefined && sensor.distance !== null
                  ? `${sensor.distance} cm`
                  : "N/A"}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Water Level</span>
              <span className="metric-value">
                {sensor.water_level !== undefined && sensor.water_level !== null
                  ? `${sensor.water_level.toFixed(2)} cm`
                  : "N/A"}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Water Flow</span>
              <span className="metric-value">
                {sensor.flow_rate !== undefined && sensor.flow_rate !== null
                  ? `${sensor.flow_rate} cm/s`
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Compact System Insights Section */}
          <div className="insights-section">
            <h3 className="section-title">System Insights</h3>
            <p className="insights-text">
              {sensor.ml_state
                ? `ML state: ${statusLabel}. Real-time values are from live sensor data.`
                : "No ML prediction on latest sample. View historical trends for analysis."}
            </p>
          </div>

          {/* Actions Section */}
          <div className="actions-section">
            <button
              className="historical-trends-button"
              onClick={() => {
                setIsTrendsModalOpen(true);
              }}
            >
              <FaChartLine />
              View Trends
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="node-wrapper">
      <div className="node-container-1">
        <div className="node-1">{renderNodeCard(nodeDetails)}</div>
      </div>

      <HistoricalTrendsModal
        isOpen={isTrendsModalOpen}
        onClose={() => setIsTrendsModalOpen(false)}
        sensor={nodeDetails}
        nodeLabel={nodeDetails?.location || "N/A"}
        events={historicalEvents}
        selectId="node-trend-view-select"
      />
    </div>
  );
}

export default NodeContainer;
