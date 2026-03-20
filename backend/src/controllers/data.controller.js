import Data from "../models/Data.js";
import Node from "../models/Node.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import {
  buildAutoNodeId,
  buildSensorIdQuery,
  buildUnclaimedLocation,
  isUnclaimedNodeLocation,
  normalizeSensorId,
} from "../utils/nodeMetadata.js";

// ML label (0-4) → backend status (0-3) mapping
const ML_TO_STATUS = { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3 };

// ── Auto-alert task creation ──────────────────────────────────────────────────
const STATUS_ALERT_TITLE = {
  1: "At Risk Alert",
  2: "Clogged Alert",
  3: "Overflow Alert",
};
const ML_STATE_DISPLAY = {
  optimal: "Optimal",
  warning: "Warning",
  at_risk: "At Risk",
  clogged: "Clogged",
  overflow: "Overflow",
};
const STATUS_PRIORITY = { 1: "medium", 2: "high", 3: "high" };

async function ensureNodeForSensor(sensor_id) {
  const normalizedSensorId = normalizeSensorId(sensor_id);
  if (!normalizedSensorId) return null;

  let node = await Node.findOne({
    sensor_id: buildSensorIdQuery(normalizedSensorId),
  });
  if (node) {
    if (node.is_claimed === undefined && isUnclaimedNodeLocation(node.location)) {
      node.location = buildUnclaimedLocation(normalizedSensorId);
      node.is_claimed = false;
      node.description = "Waiting for a super admin to claim this node.";
      await node.save();
    }

    return node;
  }

  const baseNodeId = buildAutoNodeId(normalizedSensorId);
  const baseLocation = buildUnclaimedLocation(normalizedSensorId);

  // Retry a few times in case of race conditions or duplicate node_id.
  for (let i = 0; i < 5; i += 1) {
    const suffix = i === 0 ? "" : `-${Date.now()}-${i}`;
    const node_id = `${baseNodeId}${suffix}`;
    try {
      node = await Node.create({
        node_id,
        location: baseLocation,
        status: "active",
        sensor_id: normalizedSensorId,
        is_claimed: false,
        description: "Waiting for a super admin to claim this node.",
      });
      console.log(
        `Auto-created node: ${node.node_id} for sensor ${normalizedSensorId}`,
      );
      return node;
    } catch (err) {
      if (err?.code === 11000) {
        const existing = await Node.findOne({
          sensor_id: buildSensorIdQuery(normalizedSensorId),
        });
        if (existing) return existing;
        continue;
      }
      throw err;
    }
  }

  return Node.findOne({
    sensor_id: buildSensorIdQuery(normalizedSensorId),
  });
}

async function autoCreateAlertTask(sensor_id, status, ml_state) {
  if (status < 1) return; // Normal — no alert needed
  try {
    const normalizedSensorId = normalizeSensorId(sensor_id);
    const node = await ensureNodeForSensor(normalizedSensorId);
    if (!node) return; // No registered node for this sensor, skip

    // Deduplicate: skip if an active (pending/ongoing) task already exists
    const existing = await Task.findOne({
      node_id: node._id,
      status: { $in: ["pending", "ongoing"] },
    });
    if (existing) return;

    // Find a system user to act as task creator (Super Admin > Admin > any)
    const adminRole = await Role.findOne({
      name: { $in: ["Super Admin", "Admin"] },
    });
    const systemUser = adminRole
      ? await User.findOne({ role: adminRole._id })
      : await User.findOne();
    if (!systemUser) return;

    const stateLabel =
      (ml_state && ML_STATE_DISPLAY[ml_state]) || STATUS_ALERT_TITLE[status];

    await Task.create({
      task_id: `AUTO-${node.node_id}-${Date.now()}`,
      title: `${STATUS_ALERT_TITLE[status]} – ${node.location}`,
      description: `Drainage state detected: ${stateLabel}. Auto-generated from sensor ${normalizedSensorId}.`,
      node_id: node._id,
      created_by: systemUser._id,
      priority: STATUS_PRIORITY[status] || "medium",
    });
    console.log(
      `🔔 Auto-created alert task for ${node.location} [${stateLabel}]`,
    );
  } catch (err) {
    console.error("autoCreateAlertTask error:", err.message);
  }
}

export async function getData(req, res) {
  try {
    const data = await Data.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function postData(req, res) {
  try {
    const io = req.app.get("io");

    // --- Format 1: ML Python script POST (has ml_state field) ---
    if (req.body.ml_state !== undefined) {
      const {
        ml_state,
        ml_label,
        flow_rate,
        water_level,
        rate_of_change,
        class_probabilities,
        samples_aggregated,
        batteryVoltage,
        batteryPercent,
        estimated_time_to_overflow_s,
        estimated_time_to_overflow_min,
        estimated_time_to_at_risk_s,
        estimated_time_to_at_risk_min,
      } = req.body;

      const status = ML_TO_STATUS[Number(ml_label)] ?? 0;
      const sensorId = normalizeSensorId("DRAINAGE_Module_01");

      // Ensure this sensor exists as a Node so it can appear in live alerts/details.
      await ensureNodeForSensor(sensorId);

      const newData = new Data({
        sensor_id: sensorId,
        flow_rate: flow_rate ?? 0,
        water_level: water_level ?? 0,
        status,
        ml_label: Number(ml_label),
        ml_state,
        rate_of_change,
        class_probabilities,
        samples_aggregated,
        batteryVoltage,
        batteryPercent,
        estimated_time_to_overflow_s,
        estimated_time_to_overflow_min,
        estimated_time_to_at_risk_s,
        estimated_time_to_at_risk_min,
        alertStatus: status >= 1 ? "unresolved" : undefined,
      });

      const savedData = await newData.save();
      console.log("✅ ML prediction saved:", ml_state, "(label", ml_label, ")");

      // Broadcast to all connected React clients via Socket.IO
      if (io) io.emit("new_prediction", savedData);

      // Auto-create an alert task when the ML detects a non-normal state
      await autoCreateAlertTask(
        savedData.sensor_id,
        savedData.status,
        savedData.ml_state,
      );

      return res.status(201).json(savedData);
    }
    if (req.body.mac && req.body.data) {
      const { mac, data, timestamp } = req.body;
      const normalizedMac = normalizeSensorId(mac);

      // Ensure this sensor exists as a Node so it can appear in live alerts/details.
      await ensureNodeForSensor(normalizedMac);

      // Transform ESP data to backend format
      const flow_rate = data.velocity || 0;
      const water_level = data.ultrasonic || 0;
      const distance = data.tof || 0;

      // Calculate status based on readings
      let status = 0; // Normal
      const NORMAL_LEVEL = 200;
      const AT_RISK_LEVEL = 150;
      const CLOGGED_LEVEL = 100;

      if (water_level > NORMAL_LEVEL && flow_rate < 10) {
        status = 0; // Normal
      } else if (water_level <= NORMAL_LEVEL && water_level > AT_RISK_LEVEL) {
        status = 1; // At Risk
      } else if (water_level <= AT_RISK_LEVEL && flow_rate < 5) {
        status = 2; // Clogged
      } else if (water_level <= CLOGGED_LEVEL) {
        status = 3; // Overflow
      }

      const newData = new Data({
        sensor_id: normalizedMac,
        flow_rate,
        water_level,
        status,
        delta_water_level: 0,
        distance,
        rain: 0,
        batteryVoltage: data.batteryVoltage,
        batteryPercent: data.batteryPercent,
        timestamp: timestamp || new Date(),
      });

      const savedData = await newData.save();
      console.log("✅ ESP data saved:", savedData);

      // Broadcast raw ESP data too so React can show live readings
      if (io) io.emit("new_prediction", savedData);

      // Auto-create an alert task when the sensor detects a non-normal state
      await autoCreateAlertTask(savedData.sensor_id, savedData.status, null);

      return res.status(201).json(savedData);
    }

    // Original format (for backward compatibility)
    const {
      flow_rate,
      water_level,
      status,
      delta_water_level,
      distance,
      rain,
      timestamp,
    } = req.body;

    // Validate status value
    if (![0, 1, 2, 3].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const newData = new Data({
      flow_rate,
      water_level,
      status,
      delta_water_level,
      distance,
      rain,
      timestamp: timestamp || new Date(),
    });

    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function getLatestData(req, res) {
  try {
    const latestData = await Data.findOne().sort({ createdAt: -1 });
    res.status(200).json(latestData);
  } catch (error) {
    console.error("Error fetching latest data:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function getAlertStatus(req, res) {
  try {
    // Fetch same alert data as admin and guests
    const data = await Data.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching alert data:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function updateAlertStatus(req, res) {
  try {
    const { id } = req.params;
    const { alertStatus } = req.body;

    if (!["unresolved", "ongoing", "resolved"].includes(alertStatus)) {
      return res.status(400).json({ message: "Invalid alert status" });
    }

    const updatedData = await Data.findByIdAndUpdate(
      id,
      { alertStatus },
      { new: true },
    );

    if (!updatedData) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.status(200).json(updatedData);
  } catch (error) {
    console.error("Error updating alert status:", error);
    res.status(500).json({ message: "Server Error" });
  }
}
