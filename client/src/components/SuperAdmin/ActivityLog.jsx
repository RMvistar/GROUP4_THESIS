import "./ActivityLog.css";
import { useState, useEffect } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import { useAuthStore } from "../../store/useAuthStore";

function ActivityLog() {
  const { token } = useAuthStore();

  // State for activity logs
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [nodeFilter, setNodeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Fetch activity logs on component mount
  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/activity-logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch activity logs");
      }

      const data = await response.json();
      setActivityLogs(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNodeFilterChange = (e) => {
    setNodeFilter(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  // Filter the activity logs based on search and filters
  const filteredLogs = activityLogs.filter((log) => {
    const userName = `${log.user_id?.first_name || ""} ${log.user_id?.last_name || ""}`;
    const nodeLocation = log.node_id?.location || "";
    const roleName = log.user_id?.role?.name || "";

    const matchesSearch =
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nodeLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesNode =
      nodeFilter === "all" ||
      nodeLocation.toLowerCase().includes(nodeFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      log.new_status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesRole =
      roleFilter === "all" ||
      roleName.toLowerCase() === roleFilter.toLowerCase();

    return matchesSearch && matchesNode && matchesStatus && matchesRole;
  });

  return (
    <div className="activity-log-wrapper">
      <div className="activity-log-content">
        <div className="header-section">
          <h2 className="header-title">Activity Log</h2>
        </div>

        <div className="search-filter-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select
                className="filter-dropdown"
                value={nodeFilter}
                onChange={handleNodeFilterChange}
              >
                <option value="all">All Nodes</option>
                <option value="building a">Node A</option>
                <option value="building b">Node B</option>
                <option value="building c">Node C</option>
              </select>
            </div>

            <select
              className="filter-dropdown"
              value={roleFilter}
              onChange={handleRoleFilterChange}
            >
              <option value="all">All Roles</option>
              <option value="super admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="worker">Worker</option>
            </select>

            <select
              className="filter-dropdown"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Status</option>
              <option value="unresolved">Unresolved</option>
              <option value="ongoing">Ongoing</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          {loading && (
            <p style={{ textAlign: "center", padding: "20px" }}>
              Loading activity logs...
            </p>
          )}
          {error && (
            <p style={{ textAlign: "center", padding: "20px", color: "red" }}>
              Error: {error}
            </p>
          )}

          {!loading && !error && (
            <table className="activity-log-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Node Location</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No activity logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{`${log.user_id?.first_name || ""} ${log.user_id?.last_name || ""}`}</td>
                      <td>
                        <span
                          className={`role-badge role-${(log.user_id?.role?.name || "").toLowerCase().replace(" ", "-")}`}
                        >
                          {log.user_id?.role?.name || "N/A"}
                        </span>
                      </td>
                      <td>{log.node_id?.location || "N/A"}</td>
                      <td>{log.description}</td>
                      <td>
                        <span
                          className={`status-badge status-${(log.new_status || "").toLowerCase()}`}
                        >
                          {log.new_status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityLog;
