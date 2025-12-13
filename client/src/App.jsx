import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./components/NavigationBar.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import NodeDetails from "./components/NodeDetails/NodeDetails.jsx";
import Alerts from "./components/Alerts/Alerts.jsx";
import React from "react";
import LoginPage from "./LoginPage.jsx";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
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
