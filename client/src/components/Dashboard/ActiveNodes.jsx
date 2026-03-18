import React, { useEffect, useState } from "react";
import { FaHdd } from "react-icons/fa";
import "./ActiveNodes.css";

function ActiveNodes() {
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveNodes = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/public/nodes");
        if (!res.ok) throw new Error("Failed to fetch active nodes");
        const nodes = await res.json();
        setActiveCount(Array.isArray(nodes) ? nodes.length : 0);
      } catch (err) {
        console.error("Error fetching active nodes:", err);
        setActiveCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveNodes();
    const interval = setInterval(fetchActiveNodes, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="active-nodes">
      <div className="icon-container">
        <FaHdd className="node-icon" />
      </div>
      <h3 className="widget-title">Active Nodes</h3>
      <div className="node-count">{activeCount}</div>
      <div className="node-status">{loading ? "Loading..." : "Live"}</div>
      <div className="node-status-text">Online</div>
    </div>
  );
}

export default ActiveNodes;
