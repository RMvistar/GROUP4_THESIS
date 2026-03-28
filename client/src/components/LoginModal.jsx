import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useAuthStore } from "../store/useAuthStore";
import "./LoginModal.css";

function LoginModal({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Clear error when modal is opened
  useEffect(() => {
    if (isOpen && clearError) {
      clearError();
      setName("");
      setPassword("");
      setShowPassword(false);
    }
  }, [isOpen, clearError]);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await login(name, password);
      console.log("Login successful:", user);

      // Close modal first
      onClose();

      // Route based on role
      if (user.role === "Admin") {
        navigate("/admin");
      } else if (user.role === "PowerUser") {
        navigate("/power-user");
      } else if (user.role === "Worker") {
        navigate("/worker");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={handleBackdropClick}>
      <div className="login-modal-content">
        <button
          className="login-modal-close"
          onClick={handleClose}
          disabled={loading}
          aria-label="Close modal"
        >
          <FaTimes />
        </button>

        <div className="login-modal-header">
          <h2>Welcome Back</h2>
          <p>Please login to continue</p>
        </div>

        <form onSubmit={handleLogin} className="login-modal-form">
          {error && (
            <div className="login-modal-error" role="alert">
              {error}
            </div>
          )}

          <div className="login-modal-input-group">
            <label htmlFor="username" className="login-modal-label">
              Username
            </label>
            <div className="login-modal-input-wrapper">
              <FaUser className="login-modal-input-icon" />
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                autoComplete="username"
                className="login-modal-input"
              />
            </div>
          </div>

          <div className="login-modal-input-group">
            <label htmlFor="password" className="login-modal-label">
              Password
            </label>
            <div className="login-modal-input-wrapper">
              <FaLock className="login-modal-input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                className="login-modal-input"
              />
              <button
                type="button"
                className="login-modal-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-modal-submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-modal-spinner"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
