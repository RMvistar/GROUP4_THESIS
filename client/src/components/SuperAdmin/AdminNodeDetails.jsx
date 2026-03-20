import "./AdminNodeDetails.css";
import { FaChartLine, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import HistoricalTrendsModal from "../HistoricalTrends/HistoricalTrendsModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const STATUS_LABEL = {
  0: "Optimal",
  1: "At Risk",
  2: "Clogged",
  3: "Overflow",
};

function getStatusLabel(node) {
  const mlState = node?.latest_data?.ml_state;
  if (mlState) {
    return mlState
      .replace(/_/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }

  return STATUS_LABEL[node?.latest_data?.status] || "No Data";
}

function getStatusTone(node) {
  const status = node?.latest_data?.status;

  if (status === 3) return "overflow";
  if (status === 2) return "clogged";
  if (status === 1) return "risk";
  if (!node?.latest_data) return "muted";
  return "normal";
}

function getNodeTitle(node) {
  if (!node) return "Node";
  return node.is_claimed === false ? "Unclaimed Node" : node.location;
}

function AdminNodeDetails() {
  const { token } = useAuthStore();
  const [nodes, setNodes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [trendsState, setTrendsState] = useState({
    open: false,
    node: null,
    events: [],
    loading: false,
  });
  const [formData, setFormData] = useState({
    location: "",
    macAddress: "",
  });

  const fetchNodes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/nodes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || "Failed to fetch nodes");
      }

      const data = await response.json();
      setNodes(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching nodes:", err);
      setError(err.message || "Failed to fetch nodes");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchNodes();
  }, [fetchNodes, token]);

  const sortedNodes = useMemo(() => {
    return [...nodes].sort((firstNode, secondNode) => {
      if (firstNode.is_claimed !== secondNode.is_claimed) {
        return firstNode.is_claimed === false ? -1 : 1;
      }

      const firstTimestamp =
        firstNode.latest_data?.timestamp || firstNode.createdAt || "";
      const secondTimestamp =
        secondNode.latest_data?.timestamp || secondNode.createdAt || "";

      return new Date(secondTimestamp) - new Date(firstTimestamp);
    });
  }, [nodes]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormError("");
    setFormData({
      location: "",
      macAddress: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setFormError("");

      const response = await fetch(`${API_BASE_URL}/api/nodes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location: formData.location,
          sensor_id: formData.macAddress,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to save node");
      }

      closeModal();
      await fetchNodes();
    } catch (err) {
      console.error("Error saving node:", err);
      setFormError(err.message || "Failed to save node");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNode = async () => {
    if (!deleteTarget) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/nodes/${deleteTarget}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to delete node");
      }

      setDeleteTarget(null);
      await fetchNodes();
    } catch (err) {
      console.error("Error deleting node:", err);
      alert(err.message || "Failed to return node to unclaimed state");
    }
  };

  const openTrendsModal = async (node) => {
    setTrendsState({
      open: true,
      node,
      events: [],
      loading: true,
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/public/nodes/${node.node_id}/history?limit=100`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch historical trends");
      }

      const payload = await response.json();
      const events = (payload.historical_events || [])
        .filter((item) => item.event_type === "clog" || item.event_type === "overflow")
        .map((item) => ({
          date: new Date(item.timestamp).toISOString().slice(0, 10),
          type: item.event_type,
        }));

      setTrendsState({
        open: true,
        node,
        events,
        loading: false,
      });
    } catch (err) {
      console.error("Error fetching history:", err);
      setTrendsState({
        open: true,
        node,
        events: [],
        loading: false,
      });
    }
  };

  return (
    <div className="admin-node-details-wrapper">
      <div className="admin-node-details-content">
        <div className="header-section">
          <div>
            <h2 className="page-title">Node Details</h2>
            <p className="page-subtitle">
              Unclaimed nodes appear automatically when a sensor starts sending
              data. Claim one by entering its MAC address and location.
            </p>
          </div>
          <button
            className="add-node-button"
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlus />
            Add Node
          </button>
        </div>

        {loading && <p className="page-feedback">Loading nodes...</p>}
        {!loading && error && <p className="page-feedback error">{error}</p>}

        {!loading && !error && sortedNodes.length === 0 && (
          <div className="empty-state">
            <h3>No nodes yet</h3>
            <p>
              Once a sensor sends data, it will appear here as an unclaimed node
              until the super admin assigns a location to its MAC address.
            </p>
          </div>
        )}

        {!loading && !error && sortedNodes.length > 0 && (
          <div className="node-grid">
            {sortedNodes.map((node) => {
              const statusLabel = getStatusLabel(node);
              const statusTone = getStatusTone(node);
              const latestTimestamp = node.latest_data?.timestamp;

              return (
                <div
                  key={node._id}
                  className={`nodeCard ${node.is_claimed === false ? "nodeCard-unclaimed" : ""}`}
                >
                  <div className="card-header">
                    <div className="card-header-left">
                      <span className={`status-badge status-${statusTone}`}>
                        {statusLabel.toUpperCase()}
                      </span>
                      <span
                        className={`claim-badge ${node.is_claimed === false ? "claim-unclaimed" : "claim-claimed"}`}
                      >
                        {node.is_claimed === false ? "Unclaimed" : "Claimed"}
                      </span>
                    </div>
                    <span className="timestamp">
                      {latestTimestamp
                        ? new Date(latestTimestamp).toLocaleString()
                        : "No live data yet"}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="metrics-grid">
                      <div className="metric-item">
                        <span className="metric-label">Display Name</span>
                        <span className="metric-value">{getNodeTitle(node)}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Node ID</span>
                        <span className="metric-value">{node.node_id}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">MAC Address</span>
                        <span className="metric-value">{node.sensor_id}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Location</span>
                        <span className="metric-value">
                          {node.is_claimed === false ? "Unclaimed Node" : node.location}
                        </span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Battery</span>
                        <span className="metric-value">
                          {node.latest_data?.batteryPercent !== null &&
                          node.latest_data?.batteryPercent !== undefined
                            ? `${node.latest_data.batteryPercent}%`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Water Level</span>
                        <span className="metric-value">
                          {node.latest_data?.water_level !== null &&
                          node.latest_data?.water_level !== undefined
                            ? `${Number(node.latest_data.water_level).toFixed(2)} cm`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Water Flow</span>
                        <span className="metric-value">
                          {node.latest_data?.flow_rate !== null &&
                          node.latest_data?.flow_rate !== undefined
                            ? `${node.latest_data.flow_rate} cm/s`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Clog Status</span>
                        <span className="metric-value">
                          {node.latest_data?.distance !== null &&
                          node.latest_data?.distance !== undefined
                            ? `${node.latest_data.distance} cm`
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="alerts-summary">
                      <div className="alert-pill">
                        <span className="alert-pill-label">Unresolved</span>
                        <strong>{node.alert_counts?.pending || 0}</strong>
                      </div>
                      <div className="alert-pill">
                        <span className="alert-pill-label">Ongoing</span>
                        <strong>{node.alert_counts?.ongoing || 0}</strong>
                      </div>
                      <div className="alert-pill">
                        <span className="alert-pill-label">Resolved</span>
                        <strong>{node.alert_counts?.resolved || 0}</strong>
                      </div>
                      <div className="alert-pill total">
                        <span className="alert-pill-label">Visible Alerts</span>
                        <strong>{node.alert_counts?.total || 0}</strong>
                      </div>
                    </div>

                    <div className="insights-section">
                      <h3 className="section-title">System Prediction & Insights</h3>
                      <p className="insights-text">
                        {node.is_claimed === false
                          ? `This sensor is already reporting data, but it is still unclaimed. Enter MAC address ${node.sensor_id} with a location to turn it into a named node.`
                          : node.latest_data
                            ? `Latest status is ${statusLabel}. New alerts for this MAC address will continue to appear under ${node.location}.`
                            : "This node is claimed, but it has not sent live sensor data yet."}
                      </p>
                    </div>

                    <div className="actions-section">
                      <button
                        className="historical-trends-button"
                        onClick={() => openTrendsModal(node)}
                      >
                        <FaChartLine />
                        {trendsState.loading && trendsState.node?._id === node._id
                          ? "Loading Trends..."
                          : "View Historical Trends"}
                      </button>
                      <button
                        className={`delete-node-button ${node.is_claimed === false ? "disabled" : ""}`}
                        onClick={() =>
                          node.is_claimed !== false && setDeleteTarget(node._id)
                        }
                        disabled={node.is_claimed === false}
                        title={
                          node.is_claimed === false
                            ? "This node is already unclaimed"
                            : "Return this node to unclaimed state"
                        }
                      >
                        <FaTrash />
                        {node.is_claimed === false
                          ? "Already Unclaimed"
                          : "Delete Node"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Node</h2>
              <button className="close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="macAddress">Mac address</label>
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
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter node location"
                  required
                />
              </div>
              {formError && <p className="form-error">{formError}</p>}
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Add Node"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="confirm-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Delete Node</h3>
            <p>
              This will return the node to its unclaimed state so it can appear
              again as an unclaimed node until reassigned.
            </p>
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button type="button" className="delete-btn" onClick={handleDeleteNode}>
                Delete Node
              </button>
            </div>
          </div>
        </div>
      )}

      <HistoricalTrendsModal
        isOpen={trendsState.open}
        onClose={() =>
          setTrendsState({
            open: false,
            node: null,
            events: [],
            loading: false,
          })
        }
        sensor={
          trendsState.node?.latest_data || {
            timestamp: new Date().toISOString(),
          }
        }
        nodeLabel={getNodeTitle(trendsState.node)}
        events={trendsState.events}
        selectId="admin-trend-view-select"
      />
    </div>
  );
}

export default AdminNodeDetails;
