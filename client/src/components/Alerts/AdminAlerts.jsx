import "./AdminAlerts.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useState } from "react";

function NewAlerts() {
  // Dropdown state for each node in each column
  const [unresolvedNodeAOpen, setUnresolvedNodeAOpen] = useState(false);
  const [unresolvedNodeBOpen, setUnresolvedNodeBOpen] = useState(false);
  const [ongoingNodeAOpen, setOngoingNodeAOpen] = useState(false);
  const [ongoingNodeBOpen, setOngoingNodeBOpen] = useState(false);
  const [resolvedNodeAOpen, setResolvedNodeAOpen] = useState(false);
  const [resolvedNodeBOpen, setResolvedNodeBOpen] = useState(false);
  return (
    <div className="alerts-wrapper">
      <div className="alerts-content">
        <div className="header-section">
          <h2 className="page-title">Alerts</h2>
        </div>

        <div className="counters-section">
          <div className="total-alerts-counter">
            <span className="alert-label">Total alerts</span>
            <span className="number-total-alerts">21</span>
          </div>
          <div className="unresolved-alerts-counter">
            <span className="alert-label">Unresolved alerts</span>
            <span className="number-unresolved-alerts">5</span>
          </div>
          <div className="ongoing-alerts-counter">
            <span className="alert-label">Ongoing alerts</span>
            <span className="number-ongoing-alerts">3</span>
          </div>
          <div className="resolved-alerts-counter">
            <span className="alert-label">Resolved alerts</span>
            <span className="number-resolved-alerts">13</span>
          </div>
        </div>

        <div className="body-section">
          <div className="unresolved-alerts-column">
            <span className="admin-column-title">Unresolved Alerts</span>

            {/* Node A Dropdown */}
            <div className="node-dropdown-card">
              <div
                className="node-dropdown-header"
                onClick={() => setUnresolvedNodeAOpen(!unresolvedNodeAOpen)}
              >
                <span className="node-name">Node A</span>
                <span className="node-badge">2</span>
                {unresolvedNodeAOpen ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {unresolvedNodeAOpen && (
                <div className="node-dropdown-content">
                  <p className="no-alerts">
                    Sample alerts for Node A will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Node B Dropdown */}
            <div className="node-dropdown-card">
              <div
                className="node-dropdown-header"
                onClick={() => setUnresolvedNodeBOpen(!unresolvedNodeBOpen)}
              >
                <span className="node-name">Node B</span>
                <span className="node-badge">3</span>
                {unresolvedNodeBOpen ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {unresolvedNodeBOpen && (
                <div className="node-dropdown-content">
                  <p className="no-alerts">
                    Sample alerts for Node B will appear here
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="ongoing-alerts-column">
            <span className="admin-column-title">Ongoing Alerts</span>

            {/* Node A Dropdown */}
            <div className="node-dropdown-card">
              <div
                className="node-dropdown-header"
                onClick={() => setOngoingNodeAOpen(!ongoingNodeAOpen)}
              >
                <span className="node-name">Node A</span>
                <span className="node-badge">1</span>
                {ongoingNodeAOpen ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {ongoingNodeAOpen && (
                <div className="node-dropdown-content">
                  <p className="no-alerts">
                    Sample alerts for Node A will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Node B Dropdown */}
            <div className="node-dropdown-card">
              <div
                className="node-dropdown-header"
                onClick={() => setOngoingNodeBOpen(!ongoingNodeBOpen)}
              >
                <span className="node-name">Node B</span>
                <span className="node-badge">2</span>
                {ongoingNodeBOpen ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {ongoingNodeBOpen && (
                <div className="node-dropdown-content">
                  <p className="no-alerts">
                    Sample alerts for Node B will appear here
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="resolved-alerts-column">
            <span className="admin-column-title">Resolved Alerts</span>

            {/* Node A Dropdown */}
            <div className="node-dropdown-card">
              <div
                className="node-dropdown-header"
                onClick={() => setResolvedNodeAOpen(!resolvedNodeAOpen)}
              >
                <span className="node-name">Node A</span>
                <span className="node-badge">6</span>
                {resolvedNodeAOpen ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {resolvedNodeAOpen && (
                <div className="node-dropdown-content">
                  <p className="no-alerts">
                    Sample alerts for Node A will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Node B Dropdown */}
            <div className="node-dropdown-card">
              <div
                className="node-dropdown-header"
                onClick={() => setResolvedNodeBOpen(!resolvedNodeBOpen)}
              >
                <span className="node-name">Node B</span>
                <span className="node-badge">7</span>
                {resolvedNodeBOpen ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {resolvedNodeBOpen && (
                <div className="node-dropdown-content">
                  <p className="no-alerts">
                    Sample alerts for Node B will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewAlerts;
