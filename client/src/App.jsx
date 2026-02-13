import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import NavigationBar from "./components/NavigationBar.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import NodeDetails from "./components/NodeDetails/NodeDetails.jsx";
import Alerts from "./components/Alerts/Alerts.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import React from "react";
import LoginPage from "./LoginPage.jsx";
import RegisterPage from "./RegisterPage.jsx";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <NavigationBar />
              <div className="body-container">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/node-details" element={<NodeDetails />} />
                  <Route path="/alerts" element={<Alerts />} />
                </Routes>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
