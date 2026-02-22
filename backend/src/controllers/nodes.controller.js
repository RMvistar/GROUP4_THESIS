import Node from "../models/Node.js";

// Get all nodes
export async function getNodes(req, res) {
  try {
    const nodes = await Node.find().sort({ createdAt: -1 });
    res.status(200).json(nodes);
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
    res.status(200).json(node);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Create new node (Admin only)
export async function createNode(req, res) {
  try {
    const { node_id, location, sensor_id, coordinates, description } = req.body;

    if (!node_id || !location || !sensor_id) {
      return res
        .status(400)
        .json({ message: "Node ID, location, and sensor ID are required" });
    }

    const existingNode = await Node.findOne({ node_id });
    if (existingNode) {
      return res
        .status(400)
        .json({ message: "Node with this ID already exists" });
    }

    const node = await Node.create({
      node_id,
      location,
      sensor_id,
      coordinates,
      description,
    });

    res.status(201).json({ message: "Node created successfully", node });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Update node information
export async function updateNode(req, res) {
  try {
    const { location, sensor_id, coordinates, description, last_maintenance } =
      req.body;

    const node = await Node.findByIdAndUpdate(
      req.params.id,
      { location, sensor_id, coordinates, description, last_maintenance },
      { new: true, runValidators: true },
    );

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    res.status(200).json({ message: "Node updated successfully", node });
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

    res.status(200).json({ message: "Node status updated successfully", node });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Delete node
export async function deleteNode(req, res) {
  try {
    const node = await Node.findByIdAndDelete(req.params.id);
    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }
    res.status(200).json({ message: "Node deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}
