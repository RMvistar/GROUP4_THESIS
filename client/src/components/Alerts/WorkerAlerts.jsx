import "./WorkerAlerts.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";

function WorkerAlerts() {
  const { token } = useAuthStore();

  // State for tasks
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openDropdowns, setOpenDropdowns] = useState({});

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle acknowledge button
  const handleAcknowledge = async (taskId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/tasks/${taskId}/acknowledge`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to acknowledge task");
      }

      // Refresh tasks after successful acknowledgment
      await fetchTasks();
    } catch (err) {
      console.error("Error acknowledging task:", err);
      alert(err.message);
    }
  };

  // Handle resolve button
  const handleResolve = async (taskId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/tasks/${taskId}/resolve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to resolve task");
      }

      // Refresh tasks after successful resolution
      await fetchTasks();
    } catch (err) {
      console.error("Error resolving task:", err);
      alert(err.message);
    }
  };

  // Group tasks by status and node
  const groupTasksByNodeAndStatus = (status) => {
    return tasks
      .filter((task) => task.status === status)
      .reduce((acc, task) => {
        const nodeLocation = task.node_id?.location || "Unknown Node";
        if (!acc[nodeLocation]) {
          acc[nodeLocation] = [];
        }
        acc[nodeLocation].push(task);
        return acc;
      }, {});
  };

  const pendingTasks = groupTasksByNodeAndStatus("pending");
  const ongoingTasks = groupTasksByNodeAndStatus("ongoing");
  const resolvedTasks = groupTasksByNodeAndStatus("resolved");

  const getDropdownKey = (status, nodeLocation) => `${status}-${nodeLocation}`;

  const isDropdownOpen = (status, nodeLocation) => {
    const key = getDropdownKey(status, nodeLocation);
    return openDropdowns[key] ?? true;
  };

  const toggleDropdown = (status, nodeLocation) => {
    const key = getDropdownKey(status, nodeLocation);
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? true),
    }));
  };

  // Count total tasks by status
  const totalPending = tasks.filter((t) => t.status === "pending").length;
  const totalOngoing = tasks.filter((t) => t.status === "ongoing").length;
  const totalResolved = tasks.filter((t) => t.status === "resolved").length;
  const totalTasks = tasks.length;
  return (
    <div className="worker-alerts-wrapper">
      <div className="worker-alerts-content">
        <div className="worker-header-section">
          <h2 className="worker-page-title">Alerts</h2>
        </div>

        <div className="worker-counters-section">
          <div className="worker-total-alerts-counter">
            <span className="worker-alert-label">Total alerts</span>
            <span className="worker-number-total-alerts">{totalTasks}</span>
          </div>
          <div className="worker-unresolved-alerts-counter">
            <span className="worker-alert-label">Unresolved alerts</span>
            <span className="worker-number-unresolved-alerts">
              {totalPending}
            </span>
          </div>
          <div className="worker-ongoing-alerts-counter">
            <span className="worker-alert-label">Ongoing alerts</span>
            <span className="worker-number-ongoing-alerts">{totalOngoing}</span>
          </div>
          <div className="worker-resolved-alerts-counter">
            <span className="worker-alert-label">Resolved alerts</span>
            <span className="worker-number-resolved-alerts">
              {totalResolved}
            </span>
          </div>
        </div>

        {loading && (
          <p style={{ textAlign: "center", padding: "20px" }}>
            Loading tasks...
          </p>
        )}
        {error && (
          <p style={{ textAlign: "center", padding: "20px", color: "red" }}>
            Error: {error}
          </p>
        )}

        <div className="worker-body-section">
          <div className="worker-unresolved-alerts-column">
            <span className="worker-admin-column-title">Unresolved Alerts</span>

            {Object.entries(pendingTasks).map(([nodeLocation, nodeTasks]) => {
              const isOpen = isDropdownOpen("pending", nodeLocation);

              return (
                <div key={nodeLocation} className="worker-node-dropdown-card">
                  <div
                    className="worker-node-dropdown-header"
                    onClick={() => toggleDropdown("pending", nodeLocation)}
                  >
                    <span className="worker-node-name">{nodeLocation}</span>
                    <span className="worker-node-badge">
                      {nodeTasks.length}
                    </span>
                    {isOpen ? <FaChevronDown /> : <FaChevronUp />}
                  </div>
                  {isOpen && (
                    <div className="worker-node-dropdown-content">
                      {nodeTasks.map((task) => (
                        <div key={task._id} className="worker-data-card">
                          <div className="worker-card-header">
                            <span>
                              {new Date(task.created_date).toLocaleString()}
                            </span>
                          </div>
                          <div className="worker-card-body">
                            <span>
                              <strong>{task.title}</strong>
                            </span>
                            <p>{task.description}</p>
                            <div className="worker-buttons-container">
                              <button
                                className="worker-acknowledge-button"
                                onClick={() => handleAcknowledge(task._id)}
                              >
                                Acknowledge
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {nodeTasks.length === 0 && (
                        <p className="worker-no-alerts">
                          No pending alerts for this node
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {Object.keys(pendingTasks).length === 0 && !loading && (
              <p className="worker-no-alerts">No unresolved alerts</p>
            )}
          </div>

          <div className="worker-ongoing-alerts-column">
            <span className="worker-admin-column-title">Ongoing Alerts</span>

            {Object.entries(ongoingTasks).map(([nodeLocation, nodeTasks]) => {
              const isOpen = isDropdownOpen("ongoing", nodeLocation);

              return (
                <div key={nodeLocation} className="worker-node-dropdown-card">
                  <div
                    className="worker-node-dropdown-header"
                    onClick={() => toggleDropdown("ongoing", nodeLocation)}
                  >
                    <span className="worker-node-name">{nodeLocation}</span>
                    <span className="worker-node-badge">
                      {nodeTasks.length}
                    </span>
                    {isOpen ? <FaChevronDown /> : <FaChevronUp />}
                  </div>
                  {isOpen && (
                    <div className="worker-node-dropdown-content">
                      {nodeTasks.map((task) => (
                        <div key={task._id} className="worker-data-card">
                          <div className="worker-card-header">
                            <span>
                              {new Date(task.created_date).toLocaleString()}
                            </span>
                          </div>
                          <div className="worker-card-body">
                            <span>
                              <strong>{task.title}</strong>
                            </span>
                            <p>{task.description}</p>
                            <div className="worker-buttons-container">
                              <button
                                className="worker-resolve-button"
                                onClick={() => handleResolve(task._id)}
                              >
                                Resolve
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {nodeTasks.length === 0 && (
                        <p className="worker-no-alerts">
                          No ongoing alerts for this node
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {Object.keys(ongoingTasks).length === 0 && !loading && (
              <p className="worker-no-alerts">No ongoing alerts</p>
            )}
          </div>

          <div className="worker-resolved-alerts-column">
            <span className="worker-admin-column-title">Resolved Alerts</span>

            {Object.entries(resolvedTasks).map(([nodeLocation, nodeTasks]) => {
              const isOpen = isDropdownOpen("resolved", nodeLocation);

              return (
                <div key={nodeLocation} className="worker-node-dropdown-card">
                  <div
                    className="worker-node-dropdown-header"
                    onClick={() => toggleDropdown("resolved", nodeLocation)}
                  >
                    <span className="worker-node-name">{nodeLocation}</span>
                    <span className="worker-node-badge">
                      {nodeTasks.length}
                    </span>
                    {isOpen ? <FaChevronDown /> : <FaChevronUp />}
                  </div>
                  {isOpen && (
                    <div className="worker-node-dropdown-content">
                      {nodeTasks.map((task) => (
                        <div key={task._id} className="worker-data-card">
                          <div className="worker-card-header">
                            <span>
                              {new Date(
                                task.completed_date || task.created_date,
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="worker-card-body">
                            <span>
                              <strong>{task.title}</strong>
                            </span>
                            <p>{task.description}</p>
                          </div>
                        </div>
                      ))}
                      {nodeTasks.length === 0 && (
                        <p className="worker-no-alerts">
                          No resolved alerts for this node
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {Object.keys(resolvedTasks).length === 0 && !loading && (
              <p className="worker-no-alerts">No resolved alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerAlerts;
