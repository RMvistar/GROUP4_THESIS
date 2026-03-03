import "./RolesAndPermissions.css";
import { FaEdit, FaTrash, FaTimes, FaPlus } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

// Maps UI label → backend permission string
const PERMISSION_MAP = {
  "View Dashboard": "VIEW_DASHBOARD",
  "Manage Users": "MANAGE_USERS",
  "Manage Roles": "MANAGE_ROLES",
  "Manage Tasks": "MANAGE_TASKS",
  "Assign Tasks": "ASSIGN_TASKS",
  "View Alerts": "VIEW_ALERTS",
  "Manage Nodes": "MANAGE_NODES",
  "View Data": "VIEW_DATA",
  "View Public": "VIEW_PUBLIC",
  "System Settings": "SYSTEM_SETTINGS",
};
// Reverse map: backend string → UI label
const PERMISSION_LABEL = Object.fromEntries(
  Object.entries(PERMISSION_MAP).map(([label, key]) => [key, label]),
);

const AVAILABLE_PERMISSIONS = Object.keys(PERMISSION_MAP);

function RolesAndPermissions() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editRole, setEditRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ roleName: "", permissions: [] });

  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const token = localStorage.getItem("token");
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Handle auth errors (invalid/expired token)
  const handleAuthError = (message) => {
    alert(message || "Session expired. Please login again.");
    logout();
    navigate("/login");
  };

  // Fetch all roles from backend
  const loadRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/roles`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (res.status === 401) return handleAuthError(data.message);
      if (res.ok) setRoles(data);
      else alert(data.message || "Failed to load roles");
    } catch {
      alert("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Toggle by UI label — stores/reads backend strings
  const handlePermissionToggle = (label) => {
    const key = PERMISSION_MAP[label];
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const resetForm = () => setFormData({ roleName: "", permissions: [] });

  // CREATE role
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/roles`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          name: formData.roleName,
          permissions: formData.permissions,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setIsSubmitting(false);
        return handleAuthError(data.message);
      }
      if (!res.ok) {
        alert(data.message || "Failed to create role");
        return;
      }
      await loadRoles();
      setIsModalOpen(false);
      resetForm();
    } catch {
      alert("Cannot connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal — convert stored backend strings back to checked state
  const handleEdit = (role) => {
    setEditRole(role);
    setFormData({ roleName: role.name, permissions: role.permissions });
    setIsEditModalOpen(true);
  };

  // UPDATE role
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/roles/${editRole._id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          name: formData.roleName,
          permissions: formData.permissions,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setIsSubmitting(false);
        return handleAuthError(data.message);
      }
      if (!res.ok) {
        alert(data.message || "Failed to update role");
        return;
      }
      await loadRoles();
      setIsEditModalOpen(false);
      setEditRole(null);
      resetForm();
    } catch {
      alert("Cannot connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE role
  const confirmDelete = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/roles/${deleteConfirm}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json();
      if (res.status === 401) {
        setDeleteConfirm(null);
        return handleAuthError(data.message);
      }
      if (!res.ok) {
        alert(data.message || "Failed to delete role");
        return;
      }
      await loadRoles();
    } catch {
      alert("Cannot connect to server");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <>
      <div className="roles-and-permissions-wrapper">
        <div className="roles-and-permissions-content">
          <div className="header-section">
            <h2 className="page-title">Roles and Permissions</h2>
            <button
              className="add-role-button"
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
            >
              <FaPlus /> Add Role
            </button>
          </div>

          <div className="table-container">
            <table className="roles-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3">Loading roles...</td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan="3">No roles found.</td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role._id}>
                      <td>{role.name}</td>
                      <td>
                        {role.name === "Super Admin"
                          ? "All Permissions"
                          : role.permissions.length === 0
                            ? "No permissions"
                            : role.permissions
                                .map((p) => PERMISSION_LABEL[p] || p)
                                .join(", ")}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="icon-action-btn edit"
                            title="Edit"
                            onClick={() => handleEdit(role)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="icon-action-btn delete"
                            title="Delete"
                            onClick={() => setDeleteConfirm(role._id)}
                            disabled={role.isSystem}
                          >
                            <FaTrash />
                          </button>
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

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Role</h3>
            <p>
              Are you sure you want to delete this role? This cannot be undone.
            </p>
            <div className="confirm-actions">
              <button
                className="cancel-btn"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button className="delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Role Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Role</h3>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="role-form">
              <div className="form-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter role name"
                />
              </div>

              <div className="form-group">
                <label>Permissions *</label>
                <div className="permissions-grid">
                  {AVAILABLE_PERMISSIONS.map((label) => (
                    <label key={label} className="permission-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(
                          PERMISSION_MAP[label],
                        )}
                        onChange={() => handlePermissionToggle(label)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {isEditModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Role</h3>
              <button
                className="close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="role-form">
              <div className="form-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter role name"
                />
              </div>

              <div className="form-group">
                <label>Permissions *</label>
                <div className="permissions-grid">
                  {AVAILABLE_PERMISSIONS.map((label) => (
                    <label key={label} className="permission-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(
                          PERMISSION_MAP[label],
                        )}
                        onChange={() => handlePermissionToggle(label)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default RolesAndPermissions;
