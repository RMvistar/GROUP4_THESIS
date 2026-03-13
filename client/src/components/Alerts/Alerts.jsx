import "./Alerts.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useState, useEffect } from "react";

function Alerts() {
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
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
      const response = await fetch(`${API_BASE_URL}/api/public/alerts`);

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
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

  // Public view — no action handlers needed

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
    <div className="alerts-wrapper">
      <div className="alerts-content">
        <div className="counters-section">
          <div className="total-alerts-counter">
            <span className="alert-label">Total alerts</span>
            <span className="number-total-alerts">{totalTasks}</span>
          </div>
          <div className="unresolved-alerts-counter">
            <span className="alert-label">Unresolved alerts</span>
            <span className="number-unresolved-alerts">{totalPending}</span>
          </div>
          <div className="ongoing-alerts-counter">
            <span className="alert-label">Ongoing alerts</span>
            <span className="number-ongoing-alerts">{totalOngoing}</span>
          </div>
          <div className="resolved-alerts-counter">
            <span className="alert-label">Resolved alerts</span>
            <span className="number-resolved-alerts">{totalResolved}</span>
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

        <div className="body-section">
          <div className="unresolved-alerts-column">
            <span className="column-title">Unresolved Alerts</span>

            {Object.entries(pendingTasks).map(([nodeLocation, nodeTasks]) => {
              const isOpen = isDropdownOpen("pending", nodeLocation);

              return (
                <div key={nodeLocation} className="node-dropdown-card">
                  <div
                    className="node-dropdown-header"
                    onClick={() => toggleDropdown("pending", nodeLocation)}
                  >
                    <span className="node-name">{nodeLocation}</span>
                    <span className="node-badge">{nodeTasks.length}</span>
                    {isOpen ? <FaChevronDown /> : <FaChevronUp />}
                  </div>
                  {isOpen && (
                    <div className="node-dropdown-content">
                      {nodeTasks.map((task) => (
                        <div key={task._id} className="data-card">
                          <div className="card-header">
                            <span>
                              {new Date(task.created_date).toLocaleString()}
                            </span>
                          </div>
                          <div className="card-body">
                            <span>
                              <strong>{task.title}</strong>
                            </span>
                            <p>{task.description}</p>
                          </div>
                        </div>
                      ))}
                      {nodeTasks.length === 0 && (
                        <p className="no-alerts">
                          No pending alerts for this node
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {Object.keys(pendingTasks).length === 0 && !loading && (
              <p className="no-alerts">No unresolved alerts</p>
            )}
          </div>

          <div className="ongoing-alerts-column">
            <span className="column-title">Ongoing Alerts</span>

            {Object.entries(ongoingTasks).map(([nodeLocation, nodeTasks]) => {
              const isOpen = isDropdownOpen("ongoing", nodeLocation);

              return (
                <div key={nodeLocation} className="node-dropdown-card">
                  <div
                    className="node-dropdown-header"
                    onClick={() => toggleDropdown("ongoing", nodeLocation)}
                  >
                    <span className="node-name">{nodeLocation}</span>
                    <span className="node-badge">{nodeTasks.length}</span>
                    {isOpen ? <FaChevronDown /> : <FaChevronUp />}
                  </div>
                  {isOpen && (
                    <div className="node-dropdown-content">
                      {nodeTasks.map((task) => (
                        <div key={task._id} className="data-card">
                          <div className="card-header">
                            <span>
                              {new Date(task.created_date).toLocaleString()}
                            </span>
                          </div>
                          <div className="card-body">
                            <span>
                              <strong>{task.title}</strong>
                            </span>
                            <p>{task.description}</p>
                          </div>
                        </div>
                      ))}
                      {nodeTasks.length === 0 && (
                        <p className="no-alerts">
                          No ongoing alerts for this node
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {Object.keys(ongoingTasks).length === 0 && !loading && (
              <p className="no-alerts">No ongoing alerts</p>
            )}
          </div>

          <div className="resolved-alerts-column">
            <span className="column-title">Resolved Alerts</span>

            {Object.entries(resolvedTasks).map(([nodeLocation, nodeTasks]) => {
              const isOpen = isDropdownOpen("resolved", nodeLocation);

              return (
                <div key={nodeLocation} className="node-dropdown-card">
                  <div
                    className="node-dropdown-header"
                    onClick={() => toggleDropdown("resolved", nodeLocation)}
                  >
                    <span className="node-name">{nodeLocation}</span>
                    <span className="node-badge">{nodeTasks.length}</span>
                    {isOpen ? <FaChevronDown /> : <FaChevronUp />}
                  </div>
                  {isOpen && (
                    <div className="node-dropdown-content">
                      {nodeTasks.map((task) => (
                        <div key={task._id} className="data-card">
                          <div className="card-header">
                            <span>
                              {new Date(
                                task.completed_date || task.created_date,
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="card-body">
                            <span>
                              <strong>{task.title}</strong>
                            </span>
                            <p>{task.description}</p>
                          </div>
                        </div>
                      ))}
                      {nodeTasks.length === 0 && (
                        <p className="no-alerts">
                          No resolved alerts for this node
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {Object.keys(resolvedTasks).length === 0 && !loading && (
              <p className="no-alerts">No resolved alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alerts;
