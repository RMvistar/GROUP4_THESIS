import "./ActivityLog.css";

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

  return (
    <div className="activity-log-wrapper">
      <div className="activity-log-content">
        <div className="header-section">
          <h2 className="header-title">Activity Log</h2>
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
              {activityLogs.map((log) => (
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
