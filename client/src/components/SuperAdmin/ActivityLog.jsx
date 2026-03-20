import "./ActivityLog.css";
import { useState, useEffect } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import { useAuthStore } from "../../store/useAuthStore";
import { Pagination } from "antd";
import { ConfigProvider, theme } from "antd";
import { FaTable } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
  const [nodes, setNodes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of logs per page

  // Fetch real node list once on mount for the dropdown
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/nodes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNodes(data);
        }
      } catch (err) {
        console.error("Error fetching nodes:", err);
      }
    };
    fetchNodes();
  }, [token]);

  // Re-fetch whenever any filter or search term changes
  useEffect(() => {
    fetchActivityLogs();
  }, [nodeFilter, roleFilter, statusFilter, searchTerm]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (nodeFilter !== "all") params.append("nodeLocation", nodeFilter);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(
        `http://localhost:5001/api/activity-logs?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

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

  const formatAssignedUsers = (assignedTo) => {
    if (Array.isArray(assignedTo)) {
      return assignedTo
        .map((user) =>
          [user?.first_name, user?.last_name].filter(Boolean).join(" "),
        )
        .filter(Boolean)
        .join(", ");
    }

    if (assignedTo && typeof assignedTo === "object") {
      return [assignedTo.first_name, assignedTo.last_name]
        .filter(Boolean)
        .join(" ");
    }

    return "";
  };

  const getAssignedDisplay = (log) => {
    return (
      formatAssignedUsers(log.assigned_to) ||
      formatAssignedUsers(log.task_id?.assigned_to) ||
      "Unassigned"
    );
  };

  const handleDownloadExcel = () => {
    if (!filteredLogs.length) return;

    const rows = filteredLogs.map((log) => ({
      Timestamp: new Date(log.timestamp).toLocaleString(),
      User: `${log.user_id?.first_name || ""} ${log.user_id?.last_name || ""}`.trim(),
      Role: log.user_id?.role?.name || "N/A",
      NodeLocation: log.node_id?.location || "N/A",
      Description: log.description || "",
      Status: log.new_status || "N/A",
      Assigned: getAssignedDisplay(log),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = [
      { wch: 22 }, // para sa Timestamp
      { wch: 24 }, // dayun sa User
      { wch: 14 }, // para sa Role
      { wch: 28 }, // para sa NodeLocation
      { wch: 60 }, // para sa  Description
      { wch: 14 }, //and then  Status
      { wch: 42 }, // para sa Assigned
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Activity Logs");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    const now = new Date().toISOString().slice(0, 10);
    saveAs(fileData, `activity-logs-${now}.xlsx`);
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

  // Filtering is handled server-side; activityLogs already reflects active filters
  const filteredLogs = activityLogs;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1); // Reset to first page whenever filters or search term changes
  }, [nodeFilter, roleFilter, statusFilter, searchTerm]);

  return (
    <div className="activity-log-wrapper">
      <div className="activity-log-content">
        <div className="header-section">
          <h2 className="header-title">Activity Log</h2>
          <button
            className="download-excel-btn"
            onClick={handleDownloadExcel}
            disabled={!filteredLogs.length}
          >
            <FaTable />
            Download Excel
          </button>
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
                {nodes.map((node) => (
                  <option key={node._id} value={node.location}>
                    {node.location}
                  </option>
                ))}
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
            <>
              <table className="activity-log-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Node Location</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        No activity logs found
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => (
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
                        <td>{getAssignedDisplay(log)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
                <Pagination
                  current={currentPage}
                  total={filteredLogs.length}
                  pageSize={pageSize}
                  onChange={(page) => setCurrentPage(page)}
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} entries`
                  }
                  showSizeChanger={false}
                  style={{ marginTop: "20px", textAlign: "right" }}
                />
              </ConfigProvider>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityLog;
