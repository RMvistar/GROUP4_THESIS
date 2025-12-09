import React from "react";
import "./Alerts.css";

function Alerts() {
  return (
    <>
      <div className="alerts-container-constraints">
        <div className="alerts-container">
          <div className="alert-buttons-container">
            <button className="unresolved-button">Unresolved</button>
            <button className="ongoing-button">Ongoing</button>
            <button className="resolved-button">Resolved</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Alerts;
