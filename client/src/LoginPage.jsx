import React from "react";
import "./LoginPage.css";
import { FaUser, FaLock } from "react-icons/fa";
import logo from "./assets/ARCOMLogo.png";

function LoginPage() {
  return (
    <>
      <div className="login-page">
        <div className="logo-container">
          <img src={logo} alt="ARCOM Logo" className="logo" />
        </div>
        <div className="login-container">
          <h1>Login</h1>
          <div className="input-box">
            <input type="text" placeholder="Username" />
            <FaUser className="icon" />
          </div>
          <div className="input-box">
            <input type="password" placeholder="Password" />
            <FaLock className="icon" />
          </div>
          <div className="remember-forgot">
            <label>
              <input type="checkbox" />
              Remember me
            </label>
            <a href="#">Forgot Password?</a>
          </div>
          <button className="login-button">Login</button>
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
