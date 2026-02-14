import React from "react";
import "./Alerts.css";

function Alerts() {
  return (
    <div className="alerts-container-constraints">
      <div className="alerts-container">
        <div>
          <div className="UnresolvedSection">
            <p>Unresolved Alerts</p>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
          </div>
          <div className="OngoingSection">
            <p>Ongoing Alerts</p>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
          </div>
          <div className="ResolvedSection">
            <p>Resolved Alerts</p>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
            <div className="alertCard"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alerts;
