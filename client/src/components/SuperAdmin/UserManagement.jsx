import "./UserManagement.css";
import {
  FaSearch,
  FaFilter,
  FaEllipsisV,
  FaPlus,
  FaTimes,
  FaEdit,
  FaTrash,
  FaUserShield,
  FaKey,
  FaPause,
  FaPlay,
} from "react-icons/fa";

import { useEffect, useState } from "react";
import { useSuperAdminManagementStore } from "../../store/useSuperAdminManagementStore";

function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    government_id: "",
    role: "",
  });
  const {
    register: createUser,
    getUsers,
    getRolesList,
    deleteUser,
    updateUser,
    findUserById,
  } = useSuperAdminManagementStore();

  const normalizeUser = (user) => ({
    id: user?._id || user?.id || Date.now(),
    _id: user?._id || user?.id,
    government_id: user?.government_id || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    username: user?.username || "",
    role:
      (typeof user?.role === "object" ? user?.role?.name : user?.role) ||
      "worker",
    status: user?.status || "Active",
  });

  useEffect(() => {
    const loadData = async () => {
      const [usersResult, rolesResult] = await Promise.all([
        getUsers(),
        getRolesList(),
      ]);

      if (!usersResult?.success) {
        alert(usersResult?.message || "Failed to fetch users");
      } else {
        setUsers((usersResult.users || []).map(normalizeUser));
      }

      if (rolesResult?.success) {
        setRoles(rolesResult.roles || []);
      }
    };

    loadData();
  }, [getUsers, getRolesList]);
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate username and password based on user data
  const generateCredentials = (firstName, lastName, idNumber) => {
    // Username: FirstLetterOfFirstname.LastName (e.g., J.Doe)
    const username =
      firstName && lastName
        ? `${firstName.charAt(0).toLowerCase()}.${lastName.toLowerCase()}`
        : "";

    // Password: FirstLetterOfFirstName + FirstLetterOfLastName + IDNumber
    // Example: John Doe with EMP-2024-001 = JDEMP-2024-001
    const password =
      firstName && lastName && idNumber
        ? `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}${idNumber}`
        : "";

    return { username, password };
  };

  // Get generated credentials for display
  const { username: generatedUsername, password: generatedPassword } =
    generateCredentials(
      formData.first_name,
      formData.last_name,
      formData.government_id,
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    // formData.role is now a Role ObjectId
    const roleId = formData.role;

    let result;

    if (editUser) {
      // Edit mode: update everything except government_id
      result = await updateUser(editUser._id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        role: roleId,
      });

      if (!result?.success) {
        alert(result?.message || "Failed to update user");
        setIsSubmitting(false);
        return;
      }
    } else {
      // Create mode
      const { username, password } = generateCredentials(
        formData.first_name,
        formData.last_name,
        formData.government_id,
      );

      result = await createUser(
        formData.first_name,
        formData.last_name,
        username,
        formData.email,
        formData.government_id,
        password,
        roleId,
      );

      if (!result?.success) {
        alert(result?.message || "Failed to create user");
        setIsSubmitting(false);
        return;
      }
    }

    const refreshed = await getUsers();
    if (refreshed?.success) {
      setUsers((refreshed.users || []).map(normalizeUser));
    } else {
      // fallback: reflect change locally
      if (editUser) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === editUser._id
              ? normalizeUser(result?.user ?? { ...u, ...formData })
              : u,
          ),
        );
      } else {
        setUsers((prev) => [normalizeUser(result?.user), ...prev]);
      }
    }

    setIsModalOpen(false);
    setIsSubmitting(false);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      government_id: "",
      role: "",
    });
  };
  //Edit Function
  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email || "",
      government_id: user.government_id,
      role: user.roleId || "",
    });
    setIsModalOpen(true);
    setActiveDropdown(null);
  };
  //End of Edit Function

  //Ddelete function
  const handleDelete = (userId) => {
    setDeleteConfirm(userId);
    setActiveDropdown(null);
  };

  const confirmDelete = async () => {
    const result = await deleteUser(deleteConfirm);
    if (!result?.success) {
      alert(result?.message || "Failed to delete user");
      setDeleteConfirm(null);
      return;
    }
    setUsers((prev) =>
      prev.filter((u) => u._id !== deleteConfirm && u.id !== deleteConfirm),
    );
    setDeleteConfirm(null);
  };
  // end sang delete function
  const handleResetPassword = (user) => {
    const { password } = generateCredentials(
      user.first_name,
      user.last_name,
      user.government_id,
    );
    setResetPasswordUser({ ...user, newPassword: password });
    setActiveDropdown(null);
  };

  const handleToggleStatus = (user) => {
    let newStatus;
    if (user.status === "Active") {
      newStatus = "Suspended";
    } else if (user.status === "Suspended") {
      newStatus = "Inactive";
    } else {
      newStatus = "Active";
    }
    console.log(
      `Changing ${user.first_name} ${user.last_name} status to ${newStatus}`,
    );
    // Add API call here
    setActiveDropdown(null);
  };

  const toggleDropdown = (userId) => {
    setActiveDropdown(activeDropdown === userId ? null : userId);
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.government_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      user.role.toLowerCase() === roleFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      (user.status || "Active").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="user-management-wrapper">
      <div className="user-management-content">
        {/* Header with Create Button */}
        <div className="header-section">
          <h2 className="page-title">User Management</h2>
          <button
            className="create-user-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlus /> Create User
          </button>
        </div>

        <div className="search-filter-section">
          {/* Search Bar */}
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

          {/* Filters */}
          <div className="filters">
            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select
                className="filter-dropdown"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.map((r) => (
                  <option key={r._id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              className="filter-dropdown"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID Number</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.government_id}</td>
                  <td>{user.first_name}</td>
                  <td>{user.last_name}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>
                    <span
                      className={`role-badge role-${user.role.toLowerCase().replace(/\s+/g, "")}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${(user.status || "Active").toLowerCase()}`}
                    >
                      {user.status || "Active"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="action-dropdown-wrapper">
                      <button
                        className="action-btn"
                        onClick={() => toggleDropdown(user.id)}
                      >
                        <FaEllipsisV />
                      </button>

                      {activeDropdown === user.id && (
                        <div className="action-dropdown">
                          <button
                            className="action-menu-item"
                            onClick={() => handleEdit(user)}
                          >
                            <FaEdit /> Edit User
                          </button>
                          <button
                            className="action-menu-item"
                            onClick={() => handleResetPassword(user)}
                          >
                            <FaKey /> Reset Password
                          </button>
                          <button
                            className="action-menu-item"
                            onClick={() => handleToggleStatus(user)}
                          >
                            {(user.status || "Active") === "Active" ? (
                              <FaPause />
                            ) : (
                              <FaPlay />
                            )}
                            {(user.status || "Active") === "Active"
                              ? "Suspend"
                              : (user.status || "Active") === "Suspended"
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                          <button
                            className="action-menu-item delete"
                            onClick={() => handleDelete(user.id)}
                          >
                            <FaTrash /> Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Delete User</h3>
              <p>
                Are you sure you want to delete this user? This action cannot be
                undone.
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

        {/* Reset Password Modal */}
        {resetPasswordUser && (
          <div
            className="modal-overlay"
            onClick={() => setResetPasswordUser(null)}
          >
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Password Reset</h3>
              <p>
                New password for{" "}
                <strong>
                  {resetPasswordUser.first_name} {resetPasswordUser.last_name}
                </strong>
                :
              </p>
              <div className="password-display">
                <code>{resetPasswordUser.newPassword}</code>
              </div>
              <p className="password-note">
                Please save this password and share it securely with the user.
              </p>
              <div className="confirm-actions">
                <button
                  className="submit-btn"
                  onClick={() => setResetPasswordUser(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit User Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editUser ? "Edit User" : "Create New User"}</h3>
                <button
                  className="close-btn"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditUser(null);
                    setFormData({
                      first_name: "",
                      last_name: "",
                      email: "",
                      government_id: "",
                      role: "",
                    });
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="user-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter email"
                    />
                  </div>

                  <div className="form-group">
                    <label>ID Number *</label>
                    <input
                      type="text"
                      name="government_id"
                      value={formData.government_id}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., EMP-2024-001"
                      readOnly={!!editUser}
                      className={editUser ? "readonly-input" : ""}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Select a Role --</option>
                      {roles.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Auto-generated credentials display */}
                <div className="credentials-preview">
                  <h4>Auto-Generated Credentials</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Username (Auto-generated)</label>
                      <input
                        type="text"
                        value={generatedUsername}
                        readOnly
                        className="readonly-input"
                        placeholder="Fill in name to generate"
                      />
                    </div>

                    <div className="form-group">
                      <label>Password (Auto-generated)</label>
                      <input
                        type="text"
                        value={generatedPassword}
                        readOnly
                        className="readonly-input"
                        placeholder="Fill in all fields to generate"
                      />
                    </div>
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
                    {isSubmitting
                      ? "Saving..."
                      : editUser
                        ? "Update User"
                        : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
