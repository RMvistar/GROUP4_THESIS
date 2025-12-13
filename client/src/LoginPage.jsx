import React from "react";

import "./LoginPage.css";
import { FaUser, FaLock } from "react-icons/fa";
import logo from "./assets/ARCOMLogo.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      console.log("Login successful:", user);
      console.log("Navigating to dashboard...");
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
      console.error("Error details:", error);
    }
  };

  return (
    <>
      <div className="login-page">
        <div className="logo-container">
          <img src={logo} alt="ARCOM Logo" className="logo" />
        </div>
        <div className="login-container">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <div className="input-box">
              <input
                type="email"
                placeholder="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FaUser className="icon" />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FaLock className="icon" />
            </div>
            <div className="remember-forgot">
              <label>
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#">Forgot Password?</a>
            </div>
            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="register-link">
            <p>
              Don't have an account? <a href="#">Register</a>
            </p>
            <p>or</p>
          </div>
          <button className="guest-button">Sign in as guest</button>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
