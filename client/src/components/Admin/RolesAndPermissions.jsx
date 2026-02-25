import "./RolesAndPermissions.css";
import { FaEdit, FaTrash, FaTimes, FaPlus } from "react-icons/fa";
import { useState } from "react";

function RolesAndPermissions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [formData, setFormData] = useState({
    roleName: "",
    permissions: [],
  });

  const availablePermissions = [
    "View Dashboard",
    "Manage Users",
    "Manage Roles",
    "Assign Tasks",
    "View Alerts",
    "Manage Nodes",
    "View Data",
    "System Settings",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionToggle = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Creating role:", formData);
    // Add API call here
    setIsModalOpen(false);
    setFormData({
      roleName: "",
      permissions: [],
    });
  };

  const handleEdit = (role) => {
    setEditRole(role);
    setFormData({
      roleName: role.name,
      permissions: role.permissions,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    console.log("Updating role:", editRole, formData);
    // Add API call here
    setIsEditModalOpen(false);
    setEditRole(null);
    setFormData({
      roleName: "",
      permissions: [],
    });
  };

  return (
    <>
      <div className="roles-and-permissions-wrapper">
        <div className="roles-and-permissions-content">
          <div className="header-section">
            <h2 className="page-title">Roles and Permissions</h2>
            <button
              className="add-role-button"
              onClick={() => setIsModalOpen(true)}
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
                <tr>
                  <td>Super Admin</td>
                  <td>All Permissions</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="icon-action-btn edit"
                        title="Edit"
                        onClick={() =>
                          handleEdit({
                            name: "Super Admin",
                            permissions: availablePermissions,
                          })
                        }
                      >
                        <FaEdit />
                      </button>
                      <button className="icon-action-btn delete" title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
                  {availablePermissions.map((permission) => (
                    <label key={permission} className="permission-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission)}
                        onChange={() => handlePermissionToggle(permission)}
                      />
                      <span>{permission}</span>
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
                <button type="submit" className="submit-btn">
                  Create Role
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
                  {availablePermissions.map((permission) => (
                    <label key={permission} className="permission-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission)}
                        onChange={() => handlePermissionToggle(permission)}
                      />
                      <span>{permission}</span>
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
                <button type="submit" className="submit-btn">
                  Update Role
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
