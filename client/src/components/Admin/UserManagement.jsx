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
import { useState } from "react";

function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    idNumber: "",
    role: "worker",
  });

  // Sample data - replace with actual API data
  const users = [
    {
      id: 1,
      idNumber: "EMP-2024-001",
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "john.doe@arcom.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: 2,
      idNumber: "EMP-2024-002",
      firstName: "Jane",
      lastName: "Smith",
      username: "janesmith",
      email: "jane.smith@arcom.com",
      role: "Worker",
      status: "Active",
    },
    {
      id: 3,
      idNumber: "EMP-2024-003",
      firstName: "Bob",
      lastName: "Johnson",
      username: "bobjohnson",
      email: "bob.johnson@arcom.com",
      role: "Worker",
      status: "Suspended",
    },
    {
      id: 4,
      idNumber: "EMP-2024-004",
      firstName: "Sarah",
      lastName: "Williams",
      username: "s.williams",
      email: "sarah.williams@arcom.com",
      role: "Worker",
      status: "Inactive",
    },
  ];

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
      formData.firstName,
      formData.lastName,
      formData.idNumber,
    );

  const handleSubmit = (e) => {
    e.preventDefault();

    // Generate username and password
    const { username, password } = generateCredentials(
      formData.firstName,
      formData.lastName,
      formData.idNumber,
    );

    // Prepare complete user data
    const userData = {
      ...formData,
      username,
      password,
      status: "active", // Default status for new users
    };

    // Handle form submission - add API call here
    console.log("Creating user:", userData);
    console.log("Generated Username:", username);
    console.log("Generated Password:", password);

    setIsModalOpen(false);
    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      idNumber: "",
      role: "worker",
    });
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email || "",
      idNumber: user.idNumber,
      role: user.role.toLowerCase(),
    });
    setIsModalOpen(true);
    setActiveDropdown(null);
  };

  const handleDelete = (userId) => {
    setDeleteConfirm(userId);
    setActiveDropdown(null);
  };

  const confirmDelete = () => {
    console.log("Deleting user:", deleteConfirm);
    // Add API call here
    setDeleteConfirm(null);
  };

  const handleResetPassword = (user) => {
    const { password } = generateCredentials(
      user.firstName,
      user.lastName,
      user.idNumber,
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
      `Changing ${user.firstName} ${user.lastName} status to ${newStatus}`,
    );
    // Add API call here
    setActiveDropdown(null);
  };

  const toggleDropdown = (userId) => {
    setActiveDropdown(activeDropdown === userId ? null : userId);
  };

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
                <option value="admin">Admin</option>
                <option value="worker">Worker</option>
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
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.idNumber}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>
                    <span
                      className={`role-badge role-${user.role.toLowerCase()}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${user.status.toLowerCase()}`}
                    >
                      {user.status}
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
                            {user.status === "Active" ? (
                              <FaPause />
                            ) : (
                              <FaPlay />
                            )}
                            {user.status === "Active"
                              ? "Suspend"
                              : user.status === "Suspended"
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
                  {resetPasswordUser.firstName} {resetPasswordUser.lastName}
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
                      firstName: "",
                      lastName: "",
                      email: "",
                      idNumber: "",
                      role: "worker",
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
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
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
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., EMP-2024-001"
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
                      <option value="worker">Worker</option>
                      <option value="admin">Admin</option>
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
                  <button type="submit" className="submit-btn">
                    Create User
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
