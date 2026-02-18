import React from "react";
import { FaHdd } from "react-icons/fa";
import "./ActiveNodes.css";

function ActiveNodes() {
  return (
    <div className="active-nodes">
      <div className="icon-container">
        <FaHdd className="node-icon" />
      </div>
      <h3 className="widget-title">Active Nodes</h3>
      <div className="node-count">4</div>
      <div className="node-status">/ 4</div>
      <div className="node-status-text">Online</div>
    </div>
  );
}

export default ActiveNodes;
