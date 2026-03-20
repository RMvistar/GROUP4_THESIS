import Data from "../models/Data.js";
import Node from "../models/Node.js";
import Task from "../models/Task.js";
import {
  buildAutoNodeId,
  buildSensorIdQuery,
  buildUnclaimedLocation,
  isNodeClaimed,
  normalizeSensorId,
} from "../utils/nodeMetadata.js";

async function buildAlertCounts(nodeId) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const groupedCounts = await Task.aggregate([
    {
      $match: {
        node_id: nodeId,
        $or: [
          { status: { $ne: "resolved" } },
          { status: "resolved", completed_date: { $gte: twentyFourHoursAgo } },
        ],
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = {
    pending: 0,
    ongoing: 0,
    resolved: 0,
    total: 0,
  };

  groupedCounts.forEach(({ _id, count }) => {
    if (counts[_id] !== undefined) {
      counts[_id] = count;
      counts.total += count;
    }
  });

  return counts;
}

async function buildNodeResponse(nodeDoc) {
  const node = nodeDoc.toObject();
  const [latestData, alert_counts] = await Promise.all([
    Data.findOne({ sensor_id: buildSensorIdQuery(node.sensor_id) }).sort({
      timestamp: -1,
    }),
    buildAlertCounts(nodeDoc._id),
  ]);

  return {
    ...node,
    is_claimed: isNodeClaimed(node),
    latest_data: latestData
      ? {
          sensor_id: latestData.sensor_id,
          status: latestData.status,
          ml_state: latestData.ml_state ?? null,
          water_level: latestData.water_level,
          flow_rate: latestData.flow_rate,
          batteryPercent: latestData.batteryPercent ?? null,
          batteryVoltage: latestData.batteryVoltage ?? null,
          distance: latestData.distance ?? null,
          timestamp: latestData.timestamp,
        }
      : null,
    alert_counts,
  };
}

async function generateUniqueNodeId(sensorId) {
  const baseNodeId = buildAutoNodeId(sensorId);

  for (let i = 0; i < 10; i += 1) {
    const candidate = i === 0 ? baseNodeId : `${baseNodeId}-${i + 1}`;
    const existing = await Node.findOne({ node_id: candidate });
    if (!existing) {
      return candidate;
    }
  }

  return `${baseNodeId}-${Date.now()}`;
}

async function findNodeBySensorId(sensorId) {
  const normalizedSensorId = normalizeSensorId(sensorId);
  if (!normalizedSensorId) {
    return null;
  }

  return Node.findOne({
    sensor_id: buildSensorIdQuery(normalizedSensorId),
  });
}

// Get all nodes
export async function getNodes(req, res) {
  try {
    const nodes = await Node.find().sort({ createdAt: -1 });
    const payload = await Promise.all(nodes.map(buildNodeResponse));
    payload.sort((firstNode, secondNode) => {
      if (firstNode.is_claimed !== secondNode.is_claimed) {
        return firstNode.is_claimed ? 1 : -1;
      }

      return new Date(secondNode.createdAt) - new Date(firstNode.createdAt);
    });

    res.status(200).json(payload);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get node by ID
export async function getNodeById(req, res) {
  try {
    const node = await Node.findById(req.params.id);
    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    res.status(200).json(await buildNodeResponse(node));
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Create or claim a node by MAC address
export async function createNode(req, res) {
  try {
    const {
      node_id,
      location,
      sensor_id,
      macAddress,
      coordinates,
      description,
    } = req.body;

    const normalizedSensorId = normalizeSensorId(sensor_id || macAddress);
    const normalizedLocation = String(location || "").trim();

    if (!normalizedLocation || !normalizedSensorId) {
      return res.status(400).json({
        message: "MAC address and location are required",
      });
    }

    const existingSensorNode = await findNodeBySensorId(normalizedSensorId);

    if (existingSensorNode) {
      if (isNodeClaimed(existingSensorNode)) {
        return res.status(400).json({
          message: "A node with this MAC address already exists",
        });
      }

      existingSensorNode.location = normalizedLocation;
      existingSensorNode.sensor_id = normalizedSensorId;
      existingSensorNode.coordinates = coordinates;
      existingSensorNode.description =
        description || "Claimed by super admin";
      existingSensorNode.is_claimed = true;
      existingSensorNode.claimed_at = new Date();
      await existingSensorNode.save();

      return res.status(200).json({
        message: "Node claimed successfully",
        node: await buildNodeResponse(existingSensorNode),
      });
    }

    const nextNodeId =
      String(node_id || "").trim() || (await generateUniqueNodeId(normalizedSensorId));

    const existingNodeId = await Node.findOne({ node_id: nextNodeId });
    if (existingNodeId) {
      return res.status(400).json({
        message: "Node with this ID already exists",
      });
    }

    const node = await Node.create({
      node_id: nextNodeId,
      location: normalizedLocation,
      sensor_id: normalizedSensorId,
      coordinates,
      description: description || "Claimed by super admin",
      is_claimed: true,
      claimed_at: new Date(),
    });

    res.status(201).json({
      message: "Node created successfully",
      node: await buildNodeResponse(node),
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Update node information
export async function updateNode(req, res) {
  try {
    const { location, sensor_id, coordinates, description, last_maintenance } =
      req.body;

    const updates = {};
    if (location !== undefined) updates.location = String(location).trim();
    if (sensor_id !== undefined) {
      updates.sensor_id = normalizeSensorId(sensor_id);
    }
    if (coordinates !== undefined) updates.coordinates = coordinates;
    if (description !== undefined) updates.description = description;
    if (last_maintenance !== undefined) {
      updates.last_maintenance = last_maintenance;
    }

    const node = await Node.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    res.status(200).json({
      message: "Node updated successfully",
      node: await buildNodeResponse(node),
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Update node status (activate/deactivate/maintenance)
export async function updateNodeStatus(req, res) {
  try {
    const { status } = req.body;

    if (!["active", "inactive", "maintenance"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const node = await Node.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    res.status(200).json({
      message: "Node status updated successfully",
      node: await buildNodeResponse(node),
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Return a node to its unclaimed state
export async function deleteNode(req, res) {
  try {
    const node = await Node.findById(req.params.id);
    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    node.location = buildUnclaimedLocation(node.sensor_id);
    node.description = "Waiting for a super admin to claim this node.";
    node.coordinates = undefined;
    node.last_maintenance = undefined;
    node.is_claimed = false;
    node.claimed_at = undefined;
    await node.save();

    res.status(200).json({
      message: "Node returned to unclaimed state",
      node: await buildNodeResponse(node),
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}
