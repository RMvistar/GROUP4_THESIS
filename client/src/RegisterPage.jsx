import React from "react";
import "./RegisterPage.css";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaIdCard,
} from "react-icons/fa";
import logo from "./assets/ARCOMLogo.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";

function RegisterPage() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const user = await register(first_name, last_name, name, email, password);
      console.log("Registration successful:", user);

      navigate("/login");
    } catch (err) {
      console.error("Register failed:", err);
      console.error("Error details:", error);
    }
  };

  return (
    <>
      <div className="register-page">
        <div className="logo-container">
          <img src={logo} alt="ARCOM Logo" className="logo" />
        </div>
        <div className="register-container">
          <h1>Register</h1>
          <form onSubmit={handleRegister}>
            <div className="input-box">
              <input
                type="text"
                placeholder="First name"
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <FaIdCard className="icon" />
            </div>
            <div className="input-box">
              <input
                type="text"
                placeholder="Last name"
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <FaIdCard className="icon" />
            </div>
            <div className="input-box">
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FaEnvelope className="icon" />
            </div>
            <div className="input-box">
              <input
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <FaUser className="icon" />
            </div>
            <div className="input-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FaLock className="icon" />
              {showPassword ? (
                <FaEyeSlash
                  className="icon-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                />
              ) : (
                <FaEye
                  className="icon-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                />
              )}
            </div>
            <div className="input-box">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FaLock className="icon" />
              {showConfirmPassword ? (
                <FaEyeSlash
                  className="icon-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              ) : (
                <FaEye
                  className="icon-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              )}
            </div>
            <button
              className="register-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;
