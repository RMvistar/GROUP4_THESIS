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
import RegisterPage from "./RegisterPage.jsx";
import SuperAdminPage from "./components/SuperAdmin/SuperAdminPage.jsx";
import AdminPage from "./components/SuperAdmin/Admin/AdminPage.jsx";
import WorkerPage from "./components/Worker/WorkerPage.jsx";
import LandingPage from "./components/LandingPage.jsx";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/super-admin" element={<SuperAdminPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/worker/*" element={<WorkerPage />} />
        <Route path="/home" element={<LandingPage />} />

        {/* Guest-accessible routes (no ProtectedRoute) */}
        <Route
          path="/*"
          element={
            <>
              <NavigationBar />
              <div className="body-container">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/node-details" element={<NodeDetails />} />
                  <Route path="/alerts" element={<Alerts />} />
                </Routes>
              </div>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
