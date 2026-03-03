import "./ActivityLog.css";
import { useState } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";

function ActivityLog() {
  // Sample data
  const activityLogs = [
    {
      id: 1,
      timestamp: "2026-02-25 14:30:15",
      user: "John Doe",
      nodeLocation: "Building A - Floor 2",
      description: "High water level detected",
      status: "Resolved",
    },
    {
      id: 2,
      timestamp: "2026-02-25 13:15:42",
      user: "Jane Smith",
      nodeLocation: "Building B - Floor 1",
      description: "Sensor malfunction reported",
      status: "Ongoing",
    },
    {
      id: 3,
      timestamp: "2026-02-25 12:05:28",
      user: "Bob Johnson",
      nodeLocation: "Building C - Floor 3",
      description: "Clog detected in drainage system",
      status: "Unresolved",
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [nodeFilter, setNodeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNodeFilterChange = (e) => {
    setNodeFilter(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Filter the activity logs based on search and filters
  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.nodeLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesNode =
      nodeFilter === "all" ||
      log.nodeLocation.toLowerCase().includes(nodeFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      log.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesNode && matchesStatus;
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
          <table className="activity-log-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Node Location</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.timestamp}</td>
                  <td>{log.user}</td>
                  <td>{log.nodeLocation}</td>
                  <td>{log.description}</td>
                  <td>
                    <span
                      className={`status-badge status-${log.status.toLowerCase()}`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ActivityLog;
