import "./WorkerManagement.css";
import { FaSearch, FaFilter, FaEllipsisV } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/useAuthStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

function WorkerManagement() {
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendToggle = async (userId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      await fetchUsers();
      setSelectedUserId(null);
    } catch (err) {
      setError(err.message);
      console.error("Error updating user status:", err);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.firstName &&
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName &&
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole =
      roleFilter === "all" ||
      (user.role && user.role.name.toLowerCase() === roleFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "suspended" && !user.isActive);

    // Only show worker role users
    const isWorker = user.role && user.role.name.toLowerCase() === "worker";

    return matchesSearch && matchesRole && matchesStatus && isWorker;
  });

  const toggleActionMenu = (userId) => {
    setSelectedUserId(selectedUserId === userId ? null : userId);
  };

  if (loading) {
    return <div className="loading">Loading workers...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="worker-management-wrapper">
      <div className="worker-management-content">
        <div className="header-section">
          <h2 className="header-title">Worker Management</h2>
        </div>

        <div className="search-filter-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select
                className="filter-dropdown"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="worker-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No workers found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.isActive ? "status-active" : "status-suspended"
                        }`}
                      >
                        {user.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td>
                      <div className="action-menu-container">
                        <button
                          className="action-menu-btn"
                          onClick={() => toggleActionMenu(user._id)}
                        >
                          <FaEllipsisV />
                        </button>
                        {selectedUserId === user._id && (
                          <div className="action-menu-dropdown">
                            <button
                              className="action-menu-item"
                              onClick={() =>
                                handleSuspendToggle(user._id, user.isActive)
                              }
                            >
                              {user.isActive
                                ? "Suspend Worker"
                                : "Activate Worker"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default WorkerManagement;
