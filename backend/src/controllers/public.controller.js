import Data from "../models/Data.js";
import Node from "../models/Node.js";
import Task from "../models/Task.js";

// Get flood risk information for all active nodes
export async function getFloodRiskInfo(req, res) {
  try {
    const nodes = await Node.find({ status: "active" });

    const floodRiskData = await Promise.all(
      nodes.map(async (node) => {
        // Get latest data for this node
        const latestData = await Data.findOne({ sensor_id: node.sensor_id })
          .sort({ timestamp: -1 })
          .limit(1);

        return {
          node_id: node.node_id,
          location: node.location,
          coordinates: node.coordinates,
          status: latestData ? latestData.status : 0,
          water_level: latestData ? latestData.water_level : null,
          flow_rate: latestData ? latestData.flow_rate : null,
          alertStatus: latestData ? latestData.alertStatus : "unresolved",
          last_update: latestData ? latestData.timestamp : null,
        };
      }),
    );

    res.status(200).json(floodRiskData);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get overflow predictions based on current data
export async function getOverflowPredictions(req, res) {
  try {
    // Get all data with high water levels or at-risk/overflow status
    const atRiskData = await Data.find({
      $or: [
        { status: { $in: [1, 2, 3] } }, // At Risk, Clogged, Overflow
        { water_level: { $gte: 70 } }, // High water level threshold
      ],
    })
      .sort({ timestamp: -1 })
      .limit(50);

    // Group by sensor_id to get latest for each location
    const predictions = {};
    atRiskData.forEach((data) => {
      if (!predictions[data.sensor_id]) {
        predictions[data.sensor_id] = data;
      }
    });

    // Get node details
    const predictionList = await Promise.all(
      Object.values(predictions).map(async (data) => {
        const node = await Node.findOne({ sensor_id: data.sensor_id });

        return {
          sensor_id: data.sensor_id,
          location: node ? node.location : "Unknown",
          coordinates: node ? node.coordinates : null,
          water_level: data.water_level,
          flow_rate: data.flow_rate,
          status: data.status,
          risk_level:
            data.status === 3
              ? "Critical"
              : data.status === 2
                ? "High"
                : "Medium",
          timestamp: data.timestamp,
        };
      }),
    );

    res.status(200).json(predictionList);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get node details by ID (public view)
export async function getPublicNodeDetails(req, res) {
  try {
    const node = await Node.findOne({
      node_id: req.params.nodeId,
      status: "active",
    });

    if (!node) {
      return res.status(404).json({ message: "Node not found or inactive" });
    }

    // Get latest data for this node
    const latestData = await Data.findOne({ sensor_id: node.sensor_id })
      .sort({ timestamp: -1 })
      .limit(1);

    const nodeDetails = {
      node_id: node.node_id,
      location: node.location,
      coordinates: node.coordinates,
      description: node.description,
      status: latestData ? latestData.status : 0,
      water_level: latestData ? latestData.water_level : null,
      flow_rate: latestData ? latestData.flow_rate : null,
      alertStatus: latestData ? latestData.alertStatus : "unresolved",
      last_update: latestData ? latestData.timestamp : null,
    };

    res.status(200).json(nodeDetails);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get historical data for a specific node (clog and overflow events)
export async function getNodeHistoricalData(req, res) {
  try {
    const { nodeId } = req.params;
    const { startDate, endDate, limit = 100 } = req.query;

    const node = await Node.findOne({ node_id: nodeId });
    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    // Build query for historical data
    const query = {
      sensor_id: node.sensor_id,
      $or: [
        { status: { $in: [2, 3] } }, // Clogged or Overflow
        { alertStatus: { $in: ["ongoing", "resolved"] } },
      ],
    };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const historicalData = await Data.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    const formattedData = historicalData.map((data) => ({
      water_level: data.water_level,
      flow_rate: data.flow_rate,
      status: data.status,
      alertStatus: data.alertStatus,
      timestamp: data.timestamp,
      event_type:
        data.status === 3 ? "Overflow" : data.status === 2 ? "Clog" : "At Risk",
    }));

    res.status(200).json({
      node_id: node.node_id,
      location: node.location,
      coordinates: node.coordinates,
      historical_events: formattedData,
      total_events: formattedData.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get public alerts (tasks) — read-only, no auth required
// Resolved alerts are only shown for 24 hours after they were resolved.
export async function getPublicAlerts(req, res) {
  try {
    // Calculate the cutoff: anything resolved MORE than 24 hours ago is hidden.
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const tasks = await Task.find({
      $or: [
        // Rule 1: Show all tasks that are NOT resolved (pending or ongoing).
        { status: { $ne: "resolved" } },
        // Rule 2: Show resolved tasks ONLY if they were resolved within the last 24 hours.
        { status: "resolved", completed_date: { $gte: twentyFourHoursAgo } },
      ],
    })
      .populate("node_id", "location node_id")
      .sort({ created_date: -1 })
      .select("title description status created_date completed_date node_id");

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get all active nodes (public list)
export async function getActiveNodes(req, res) {
  try {
    const nodes = await Node.find({ status: "active" }).select(
      "node_id location coordinates description",
    );
    res.status(200).json(nodes);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}
