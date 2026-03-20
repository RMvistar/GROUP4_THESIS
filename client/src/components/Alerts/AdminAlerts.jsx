import "./AdminAlerts.css";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { ConfigProvider, Pagination } from "antd";

function AdminAlerts() {
  const ALERTS_PER_PAGE = 2;
  const { token, user } = useAuthStore();

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

  const [openDropdowns, setOpenDropdowns] = useState({});
  const [nodePages, setNodePages] = useState({});

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
      // Only include users with Worker role
      const filtered = data.filter(
        (u) => u.role && u.role.name && u.role.name.toLowerCase() === "worker"
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

  const getNodePageKey = (status, nodeLocation) => `${status}-${nodeLocation}`;

  const getCurrentPage = (status, nodeLocation, totalItems) => {
    const key = getNodePageKey(status, nodeLocation);
    const maxPage = Math.max(1, Math.ceil(totalItems / ALERTS_PER_PAGE));
    return Math.min(nodePages[key] || 1, maxPage);
  };

  const getPaginatedNodeTasks = (status, nodeLocation, nodeTasks) => {
    const currentPage = getCurrentPage(status, nodeLocation, nodeTasks.length);
    const start = (currentPage - 1) * ALERTS_PER_PAGE;
    return nodeTasks.slice(start, start + ALERTS_PER_PAGE);
  };

  const handleNodePageChange = (status, nodeLocation, page) => {
    const key = getNodePageKey(status, nodeLocation);
    setNodePages((prev) => ({
      ...prev,
      [key]: page,
    }));
  };

  // Count total tasks by status
  const totalPending = tasks.filter((t) => t.status === "pending").length;
  const totalOngoing = tasks.filter((t) => t.status === "ongoing").length;
  const totalResolved = tasks.filter((t) => t.status === "resolved").length;
  const totalTasks = tasks.length;
  return (
    <div className="admin-alerts-wrapper">
      <div className="admin-alerts-content">
        <div className="admin-header-section">
          <h2 className="admin-page-title">Alerts</h2>
        </div>

        <div className="admin-counters-section">
          <div className="admin-total-alerts-counter">
            <span className="admin-alert-label">Total alerts</span>
            <span className="admin-number-total-alerts">{totalTasks}</span>
          </div>
          <div className="admin-unresolved-alerts-counter">
            <span className="admin-alert-label">Unresolved alerts</span>
            <span className="admin-number-unresolved-alerts">
              {totalPending}
            </span>
          </div>
          <div className="admin-ongoing-alerts-counter">
            <span className="admin-alert-label">Ongoing alerts</span>
            <span className="admin-number-ongoing-alerts">{totalOngoing}</span>
          </div>
          <div className="admin-resolved-alerts-counter">
            <span className="admin-alert-label">Resolved alerts</span>
            <span className="admin-number-resolved-alerts">
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

        <div className="admin-body-section">
          <div className="admin-unresolved-alerts-column">
            <span className="admin-column-title">Unresolved Alerts</span>

            {Object.entries(pendingTasks).map(([nodeLocation, nodeTasks]) => {
              const isOpen = isDropdownOpen("pending", nodeLocation);
              const currentPage = getCurrentPage(
                "pending",
                nodeLocation,
                nodeTasks.length,
              );
              const paginatedTasks = getPaginatedNodeTasks(
                "pending",
                nodeLocation,
                nodeTasks,
              );

              return (
                <div key={nodeLocation} className="admin-node-dropdown-card">
                  <div
                    className="admin-node-dropdown-header"
                    onClick={() => toggleDropdown("pending", nodeLocation)}
                  >
                    <span className="admin-node-name">{nodeLocation}</span>
                    <span className="admin-node-badge">{nodeTasks.length}</span>
                    {isOpen ? <FaChevronDown /> : <FaChevronUp />}
                  </div>
                  {isOpen && (
                    <div className="admin-node-dropdown-content">
                      {paginatedTasks.map((task) => (
                        <div key={task._id} className="admin-data-card">
                          <div className="admin-card-header">
                            <span>
                              {new Date(task.created_date).toLocaleString()}
                            </span>
                          </div>
                          <div className="admin-card-body">
                            <span>
                              <strong>{task.title}</strong>
                            </span>
                            <p>{task.description}</p>
                            <div className="admin-buttons-container">
                              <button
                                className="admin-acknowledge-button"
                                onClick={() => handleAcknowledge(task._id)}
                              >
                                Acknowledge
                              </button>
                              {/* Always show Assign button for Super Admin and Admin */}
                              {user && user.role && (user.role === "Super Admin" || user.role === "Admin") && (
                                <button
                                  className="admin-assign-button"
                                  onClick={() => openAssignModal(task._id)}
                                >
                                  Assign
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {nodeTasks.length === 0 && (
                        <p className="admin-no-alerts">
                          No pending alerts for this node
                        </p>
                      )}
                      {nodeTasks.length > ALERTS_PER_PAGE && (
                        <div className="admin-node-pagination-wrapper">
                          <ConfigProvider
                            theme={{
                              token: {
                                colorText: "#dbeafe",
                                colorTextDisabled: "rgba(219, 234, 254, 0.45)",
                                colorPrimary: "#3b82f6",
                                colorBgContainer: "#0f1b2e",
                                borderRadius: 6,
                              },
                            }}
                          >
                            <Pagination
                              current={currentPage}
                              pageSize={ALERTS_PER_PAGE}
                              total={nodeTasks.length}
                              onChange={(page) =>
                                handleNodePageChange(
                                  "pending",
                                  nodeLocation,
                                  page,
                                )
                              }
                              showSizeChanger={false}
                              size="small"
                            />
                          </ConfigProvider>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {Object.keys(pendingTasks).length === 0 && !loading && (
              <p className="admin-no-alerts">No unresolved alerts</p>
            )}
          </div>

          <div className="admin-ongoing-alerts-column">
            <span className="admin-column-title">Ongoing Alerts</span>

            {Object.entries(ongoingTasks).map(([nodeLocation, nodeTasks]) => {
              const isOpen = isDropdownOpen("ongoing", nodeLocation);
              const currentPage = getCurrentPage(
                "ongoing",
                nodeLocation,
                nodeTasks.length,
              );
              const paginatedTasks = getPaginatedNodeTasks(
                "ongoing",
                nodeLocation,
                nodeTasks,
              );

              return (
                <div key={nodeLocation} className="admin-node-dropdown-card">
                  <div
                    className="admin-node-dropdown-header"
                    onClick={() => toggleDropdown("ongoing", nodeLocation)}
                  >
                    <span className="admin-node-name">{nodeLocation}</span>
                    <span className="admin-node-badge">{nodeTasks.length}</span>
                    {isOpen ? <FaChevronDown /> : <FaChevronUp />}
                  </div>
                  {isOpen && (
                    <div className="admin-node-dropdown-content">
                      {paginatedTasks.map((task) => (
                        <div key={task._id} className="admin-data-card">
                          <div className="admin-card-header">
                            <span>
                              {new Date(task.created_date).toLocaleString()}
                            </span>
                          </div>
                          <div className="admin-card-body">
                            <span>
                              <strong>{task.title}</strong>
                            </span>
                            <p>{task.description}</p>
                            <div className="admin-buttons-container">
                              <button
                                className="admin-resolve-button"
                                onClick={() => handleResolve(task._id)}
                              >
                                Resolve
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {nodeTasks.length === 0 && (
                        <p className="admin-no-alerts">
                          No ongoing alerts for this node
                        </p>
                      )}
                      {nodeTasks.length > ALERTS_PER_PAGE && (
                        <div className="admin-node-pagination-wrapper">
                          <ConfigProvider
                            theme={{
                              token: {
                                colorText: "#dbeafe",
                                colorTextDisabled: "rgba(219, 234, 254, 0.45)",
                                colorPrimary: "#3b82f6",
                                colorBgContainer: "#0f1b2e",
                                borderRadius: 6,
                              },
                            }}
                          >
                            <Pagination
                              current={currentPage}
                              pageSize={ALERTS_PER_PAGE}
                              total={nodeTasks.length}
                              onChange={(page) =>
                                handleNodePageChange(
                                  "ongoing",
                                  nodeLocation,
                                  page,
                                )
                              }
                              showSizeChanger={false}
                              size="small"
                            />
                          </ConfigProvider>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {Object.keys(ongoingTasks).length === 0 && !loading && (
              <p className="admin-no-alerts">No ongoing alerts</p>
            )}
          </div>

          <div className="admin-resolved-alerts-column">
            <span className="admin-column-title">Resolved Alerts</span>

            {Object.entries(resolvedTasks).map(([nodeLocation, nodeTasks]) => {
              const isOpen = isDropdownOpen("resolved", nodeLocation);
              const currentPage = getCurrentPage(
                "resolved",
                nodeLocation,
                nodeTasks.length,
              );
              const paginatedTasks = getPaginatedNodeTasks(
                "resolved",
                nodeLocation,
                nodeTasks,
              );

              return (
                <div key={nodeLocation} className="admin-node-dropdown-card">
                  <div
                    className="admin-node-dropdown-header"
                    onClick={() => toggleDropdown("resolved", nodeLocation)}
                  >
                    <span className="admin-node-name">{nodeLocation}</span>
                    <span className="admin-node-badge">{nodeTasks.length}</span>
                    {isOpen ? <FaChevronDown /> : <FaChevronUp />}
                  </div>
                  {isOpen && (
                    <div className="admin-node-dropdown-content">
                      {paginatedTasks.map((task) => (
                        <div key={task._id} className="admin-data-card">
                          <div className="admin-card-header">
                            <span>
                              {new Date(
                                task.completed_date || task.created_date,
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="admin-card-body">
                            <span>
                              <strong>{task.title}</strong>
                            </span>
                            <p>{task.description}</p>
                          </div>
                        </div>
                      ))}
                      {nodeTasks.length === 0 && (
                        <p className="admin-no-alerts">
                          No resolved alerts for this node
                        </p>
                      )}
                      {nodeTasks.length > ALERTS_PER_PAGE && (
                        <div className="admin-node-pagination-wrapper">
                          <ConfigProvider
                            theme={{
                              token: {
                                colorText: "#dbeafe",
                                colorTextDisabled: "rgba(219, 234, 254, 0.45)",
                                colorPrimary: "#3b82f6",
                                colorBgContainer: "#0f1b2e",
                                borderRadius: 6,
                              },
                            }}
                          >
                            <Pagination
                              current={currentPage}
                              pageSize={ALERTS_PER_PAGE}
                              total={nodeTasks.length}
                              onChange={(page) =>
                                handleNodePageChange(
                                  "resolved",
                                  nodeLocation,
                                  page,
                                )
                              }
                              showSizeChanger={false}
                              size="small"
                            />
                          </ConfigProvider>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {Object.keys(resolvedTasks).length === 0 && !loading && (
              <p className="admin-no-alerts">No resolved alerts</p>
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

export default AdminAlerts;
