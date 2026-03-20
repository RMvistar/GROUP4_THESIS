import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import logo from "../assets/ARCOMLogo2.png";
import LoginModal from "./LoginModal.jsx";
import "./NavigationBar.css";

function NavigationBar() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    const roleName = typeof user?.role === "string" ? user.role : user?.role?.name;
    if (roleName === "Admin" || roleName === "Super Admin") {
      navigate("/dashboard");
    } else {
      navigate("/home");
    }
  };

  const handleAdminLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const roleName =
    typeof user?.role === "string" ? user.role : user?.role?.name;
  const isAdmin = roleName?.toLowerCase() === "admin";
  const isLoggedIn = !!user;

  return (
    <nav className="navigation-bar">
      <ul>
        <li>
          <div className="logo-container">
            <img src={logo} alt="ARCOM Logo" className="logo" />
          </div>
        </li>
        {isAdmin && (
          <li>
            <NavLink to="/admin">Admin</NavLink>
          </li>
        )}
        <li>
          <NavLink to="/home">Home</NavLink>
        </li>
        <li>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/node-details">Node Details</NavLink>
        </li>
        <li>
          <NavLink to="/alerts">Alerts</NavLink>
        </li>
        {isLoggedIn && (
          <li>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </li>
        )}
        {!isLoggedIn && (
          <li>
            <button className="admin-login-button" onClick={handleAdminLogin}>
              Login
            </button>
          </li>
        )}
      </ul>

      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
    </nav>
  );
}

export default NavigationBar;
