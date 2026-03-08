import "./AdminAlerts.css";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";

function NewAlerts() {
  const { token } = useAuthStore();

  // State for tasks
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assign modal state
  const [assignModal, setAssignModal] = useState({ open: false, taskId: null });
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Dropdown state for each node in each column
  const [unresolvedNodeAOpen, setUnresolvedNodeAOpen] = useState(false);
  const [unresolvedNodeBOpen, setUnresolvedNodeBOpen] = useState(false);
  const [ongoingNodeAOpen, setOngoingNodeAOpen] = useState(false);
  const [ongoingNodeBOpen, setOngoingNodeBOpen] = useState(false);
  const [resolvedNodeAOpen, setResolvedNodeAOpen] = useState(false);
  const [resolvedNodeBOpen, setResolvedNodeBOpen] = useState(false);

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

  // Open assign modal and fetch users
  const openAssignModal = async (taskId) => {
    setAssignModal({ open: true, taskId });
    setSelectedUser("");
    setUsersLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      // Filter out super-admin users
      const filtered = data.filter(
        (u) =>
          u.role && u.role.name && u.role.name.toLowerCase() !== "super admin",
      );
      setUsers(filtered);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const closeAssignModal = () => {
    setAssignModal({ open: false, taskId: null });
    setSelectedUser("");
  };

  const handleAssignSubmit = async () => {
    if (!selectedUser) return;
    setAssigning(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/tasks/${assignModal.taskId}/delegate`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assigned_to: selectedUser }),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to assign task");
      }
      closeAssignModal();
      await fetchTasks();
    } catch (err) {
      console.error("Error assigning task:", err);
      alert(err.message);
    } finally {
      setAssigning(false);
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

  // Count total tasks by status
  const totalPending = tasks.filter((t) => t.status === "pending").length;
  const totalOngoing = tasks.filter((t) => t.status === "ongoing").length;
  const totalResolved = tasks.filter((t) => t.status === "resolved").length;
  const totalTasks = tasks.length;
  return (
    <div className="alerts-wrapper">
      <div className="alerts-content">
        <div className="header-section">
          <h2 className="page-title">Alerts</h2>
        </div>

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
            <span className="admin-column-title">Unresolved Alerts</span>

            {Object.entries(pendingTasks).map(
              ([nodeLocation, nodeTasks], index) => (
                <div key={nodeLocation} className="node-dropdown-card">
                  <div
                    className="node-dropdown-header"
                    onClick={() => {
                      const stateKey = `unresolvedNode${index}Open`;
                      eval(`setUnresolvedNode${index}Open(!${stateKey})`);
                    }}
                  >
                    <span className="node-name">{nodeLocation}</span>
                    <span className="node-badge">{nodeTasks.length}</span>
                    <FaChevronDown />
                  </div>
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
                          <div className="buttons-container">
                            <button
                              className="acknowledge-button"
                              onClick={() => handleAcknowledge(task._id)}
                            >
                              Acknowledge
                            </button>
                            <button
                              className="assign-button"
                              onClick={() => openAssignModal(task._id)}
                            >
                              Assign
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {nodeTasks.length === 0 && (
                      <p className="no-alerts">
                        No pending alerts for this node
                      </p>
                    )}
                  </div>
                </div>
              ),
            )}

            {Object.keys(pendingTasks).length === 0 && !loading && (
              <p className="no-alerts">No unresolved alerts</p>
            )}
          </div>

          <div className="ongoing-alerts-column">
            <span className="admin-column-title">Ongoing Alerts</span>

            {Object.entries(ongoingTasks).map(([nodeLocation, nodeTasks]) => (
              <div key={nodeLocation} className="node-dropdown-card">
                <div className="node-dropdown-header">
                  <span className="node-name">{nodeLocation}</span>
                  <span className="node-badge">{nodeTasks.length}</span>
                  <FaChevronDown />
                </div>
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
                        <div className="buttons-container">
                          <button
                            className="resolve-button"
                            onClick={() => handleResolve(task._id)}
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {nodeTasks.length === 0 && (
                    <p className="no-alerts">No ongoing alerts for this node</p>
                  )}
                </div>
              </div>
            ))}

            {Object.keys(ongoingTasks).length === 0 && !loading && (
              <p className="no-alerts">No ongoing alerts</p>
            )}
          </div>

          <div className="resolved-alerts-column">
            <span className="admin-column-title">Resolved Alerts</span>

            {Object.entries(resolvedTasks).map(([nodeLocation, nodeTasks]) => (
              <div key={nodeLocation} className="node-dropdown-card">
                <div className="node-dropdown-header">
                  <span className="node-name">{nodeLocation}</span>
                  <span className="node-badge">{nodeTasks.length}</span>
                  <FaChevronDown />
                </div>
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
              </div>
            ))}

            {Object.keys(resolvedTasks).length === 0 && !loading && (
              <p className="no-alerts">No resolved alerts</p>
            )}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {assignModal.open && (
        <div className="assign-modal-overlay" onClick={closeAssignModal}>
          <div className="assign-modal" onClick={(e) => e.stopPropagation()}>
            <div className="assign-modal-header">
              <h3 className="assign-modal-title">Assign Task</h3>
              <button className="assign-modal-close" onClick={closeAssignModal}>
                <FaTimes />
              </button>
            </div>
            <div className="assign-modal-body">
              <p className="assign-modal-label">
                Select a user to assign this task to:
              </p>
              {usersLoading ? (
                <p className="assign-modal-loading">Loading users...</p>
              ) : users.length === 0 ? (
                <p className="assign-modal-empty">No assignable users found.</p>
              ) : (
                <div className="assign-user-list">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className={`assign-user-item${
                        selectedUser === user._id ? " selected" : ""
                      }`}
                      onClick={() => setSelectedUser(user._id)}
                    >
                      <div className="assign-user-avatar">
                        {user.first_name?.[0]}
                        {user.last_name?.[0]}
                      </div>
                      <div className="assign-user-info">
                        <span className="assign-user-name">
                          {user.first_name} {user.last_name}
                        </span>
                        <span className="assign-user-role">
                          {user.role?.name || "No Role"}
                        </span>
                      </div>
                      {selectedUser === user._id && (
                        <div className="assign-user-check">&#10003;</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="assign-modal-footer">
              <button
                className="assign-modal-cancel"
                onClick={closeAssignModal}
              >
                Cancel
              </button>
              <button
                className="assign-modal-confirm"
                onClick={handleAssignSubmit}
                disabled={!selectedUser || assigning}
              >
                {assigning ? "Assigning..." : "Confirm Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewAlerts;
