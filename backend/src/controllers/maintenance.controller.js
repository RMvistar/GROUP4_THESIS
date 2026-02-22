import MaintenanceLog from "../models/MaintenanceLog.js";
import Node from "../models/Node.js";

// Get all maintenance logs (Admin)
export async function getMaintenanceLogs(req, res) {
  try {
    const logs = await MaintenanceLog.find()
      .populate("task_id", "task_id title")
      .populate("worker_id", "first_name last_name email")
      .populate("node_id", "node_id location")
      .sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get maintenance logs by node ID
export async function getLogsByNode(req, res) {
  try {
    const logs = await MaintenanceLog.find({ node_id: req.params.nodeId })
      .populate("task_id", "task_id title")
      .populate("worker_id", "first_name last_name email")
      .sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get maintenance logs by worker ID
export async function getLogsByWorker(req, res) {
  try {
    const logs = await MaintenanceLog.find({ worker_id: req.params.workerId })
      .populate("task_id", "task_id title")
      .populate("node_id", "node_id location")
      .sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get own maintenance logs (Worker)
export async function getMyLogs(req, res) {
  try {
    const logs = await MaintenanceLog.find({ worker_id: req.user.userId })
      .populate("task_id", "task_id title")
      .populate("node_id", "node_id location")
      .sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Create maintenance log (Worker)
export async function createMaintenanceLog(req, res) {
  try {
    const { task_id, node_id, action_taken, parts_replaced, notes, images } =
      req.body;

    if (!task_id || !node_id || !action_taken) {
      return res
        .status(400)
        .json({ message: "Task ID, node ID, and action taken are required" });
    }

    const log = await MaintenanceLog.create({
      task_id,
      worker_id: req.user.userId,
      node_id,
      action_taken,
      parts_replaced: parts_replaced || [],
      notes,
      images: images || [],
    });

    // Update node's last maintenance date
    await Node.findByIdAndUpdate(node_id, { last_maintenance: new Date() });

    const populatedLog = await MaintenanceLog.findById(log._id)
      .populate("task_id", "task_id title")
      .populate("node_id", "node_id location");

    res
      .status(201)
      .json({
        message: "Maintenance log created successfully",
        log: populatedLog,
      });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get maintenance log by ID
export async function getLogById(req, res) {
  try {
    const log = await MaintenanceLog.findById(req.params.id)
      .populate("task_id", "task_id title")
      .populate("worker_id", "first_name last_name email")
      .populate("node_id", "node_id location");

    if (!log) {
      return res.status(404).json({ message: "Maintenance log not found" });
    }

    res.status(200).json(log);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Download maintenance logs (Admin) - Returns JSON for now
export async function downloadLogs(req, res) {
  try {
    const { startDate, endDate, nodeId, workerId } = req.query;

    const query = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (nodeId) query.node_id = nodeId;
    if (workerId) query.worker_id = workerId;

    const logs = await MaintenanceLog.find(query)
      .populate("task_id", "task_id title")
      .populate("worker_id", "first_name last_name email")
      .populate("node_id", "node_id location")
      .sort({ timestamp: -1 });

    // Set headers for download
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=maintenance-logs-${Date.now()}.json`,
    );

    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Delete maintenance log (Admin only)
export async function deleteLog(req, res) {
  try {
    const log = await MaintenanceLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ message: "Maintenance log not found" });
    }
    res.status(200).json({ message: "Maintenance log deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}
