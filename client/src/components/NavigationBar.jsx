import React, { useState } from "react";
import { NavLink, replace, useNavigate } from "react-router-dom";
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
    navigate("/dashboard");
  };

  const handleAdminLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const isAdmin = user?.role === "admin";

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
        {isAdmin && (
          <li>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </li>
        )}
        {!isAdmin && (
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
