import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavigationBar from "./components/NavigationBar.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import NodeDetails from "./components/NodeDetails/NodeDetails.jsx";
import Alerts from "./components/Alerts/Alerts.jsx";
import "./App.css";

function App() {
  return (
    <Router>
      <NavigationBar />
      <div className="body-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/node-details" element={<NodeDetails />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
