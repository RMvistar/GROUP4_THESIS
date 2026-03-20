import "./Tasks.css";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";

function getAssignedByName(task) {
  const assignedBy = task.assigned_by || task.created_by;
  if (!assignedBy) return "-";

  const fullName = [assignedBy.first_name, assignedBy.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || assignedBy.username || "-";
}

function Tasks() {
  const { token } = useAuthStore();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5001/api/tasks/my-tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();
        setTasks(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTasks();
  }, [token]);

  return (
    <div className="tasks-wrapper">
      <div className="tasks-content">
        <div className="header-section">
          <h2 className="page-title">Tasks</h2>
        </div>

        <table className="tasks-table">
          <thead>
            <tr>
              <th>Node Location</th>
              <th>Task Description</th>
              <th>Assigned By</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan="3"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#9ca3af",
                  }}
                >
                  Loading tasks...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td
                  colSpan="3"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#ef4444",
                  }}
                >
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && tasks.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#9ca3af",
                  }}
                >
                  No tasks found.
                </td>
              </tr>
            )}
            {tasks.map((task) => (
              <tr key={task._id}>
                <td>{task.node_id?.location || "-"}</td>
                <td>{task.title}</td>
                <td>{getAssignedByName(task)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Tasks;
