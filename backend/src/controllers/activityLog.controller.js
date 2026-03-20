import ActivityLog from "../models/ActivityLog.js";

export async function getActivityLogs(req, res) {
  try {
    const { nodeId, nodeLocation, status, role, search } = req.query;
    let query = {};

    // Filter by nodeId (MongoDB ObjectId) if provided
    if (nodeId && nodeId !== "all") {
      query.node_id = nodeId;
    }

    // Filter by status at the DB level
    if (status && status !== "all") {
      query.new_status = { $regex: new RegExp(`^${status}$`, "i") };
    }

    const logs = await ActivityLog.find(query)
      .populate("user_id", "first_name last_name email")
      .populate({
        path: "user_id",
        populate: { path: "role", select: "name" },
      })
      .populate("assigned_to", "first_name last_name email")
      .populate("node_id", "node_id location")
      .populate("task_id", "title description assigned_to")
      .populate({
        path: "task_id",
        populate: { path: "assigned_to", select: "first_name last_name email" },
      })
      .sort({ timestamp: -1 });

    let filteredLogs = logs;

    // Filter by node location string (e.g. "building b - floor 1")
    if (nodeLocation && nodeLocation !== "all") {
      const locationLower = nodeLocation.toLowerCase();
      filteredLogs = filteredLogs.filter((log) =>
        log.node_id?.location?.toLowerCase().includes(locationLower),
      );
    }

    // Filter by role
    if (role && role !== "all") {
      filteredLogs = filteredLogs.filter(
        (log) => log.user_id?.role?.name?.toLowerCase() === role.toLowerCase(),
      );
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.user_id?.first_name?.toLowerCase().includes(searchLower) ||
          log.user_id?.last_name?.toLowerCase().includes(searchLower) ||
          log.node_id?.location?.toLowerCase().includes(searchLower) ||
          log.description?.toLowerCase().includes(searchLower),
      );
    }

    res.status(200).json(filteredLogs);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Create activity log (helper function for internal use)
export async function createActivityLog(logData) {
  try {
    const log = await ActivityLog.create(logData);
    return log;
  } catch (err) {
    console.error("Error creating activity log:", err);
    throw err;
  }
}
