import Task from "../models/Task.js";
import { emitTaskUpdate } from "../utils/taskEvents.js";

//new  methods para sa tasks

import { createActivityLog } from "./activityLog.controller.js";

// Add these NEW functions to the existing file:

function normalizeAssignedTo(assignedTo) {
  if (!assignedTo) {
    return [];
  }

  const normalized = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

  return [...new Set(normalized.map(String))];
}

function isTaskAssignedToUser(task, userId) {
  return normalizeAssignedTo(task.assigned_to).includes(String(userId));
}

function getAssignedToForLog(task) {
  return normalizeAssignedTo(task.assigned_to);
}

// Acknowledge task (moves from pending to ongoing)
export async function acknowledgeTask(req, res) {
  try {
    const task = await Task.findById(req.params.id).populate(
      "node_id",
      "node_id location",
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "pending") {
      return res.status(400).json({
        message: "Task must be in pending status to acknowledge",
      });
    }

    // Update task status
    const previousStatus = task.status;
    task.status = "ongoing";
    await task.save();

    // Create activity log
    await createActivityLog({
      task_id: task._id,
      user_id: req.user._id, // This comes from the JWT token
      node_id: task.node_id._id,
      assigned_to: getAssignedToForLog(task),
      action: "acknowledged",
      description: `Task "${task.title}" was acknowledged by ${req.user.first_name} ${req.user.last_name}`,
      previous_status: previousStatus,
      new_status: "ongoing",
    });

    emitTaskUpdate(req.app.get("io"), task);

    res.status(200).json({
      message: "Task acknowledged successfully",
      task,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Resolve task (moves from ongoing to resolved)
export async function resolveTask(req, res) {
  try {
    const task = await Task.findById(req.params.id).populate(
      "node_id",
      "node_id location",
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "ongoing") {
      return res.status(400).json({
        message: "Task must be in ongoing status to resolve",
      });
    }

    // Update task status
    const previousStatus = task.status;
    task.status = "resolved";
    task.completed_date = new Date();
    await task.save();

    // Create activity log
    await createActivityLog({
      task_id: task._id,
      user_id: req.user._id, // This comes from the JWT token
      node_id: task.node_id._id,
      assigned_to: getAssignedToForLog(task),
      action: "resolved",
      description: `Task "${task.title}" was resolved by ${req.user.first_name} ${req.user.last_name}`,
      previous_status: previousStatus,
      new_status: "resolved",
    });

    emitTaskUpdate(req.app.get("io"), task);

    res.status(200).json({
      message: "Task resolved successfully",
      task,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get all tasks (Admin)
// Resolved alerts older than 24 hours are excluded.
export async function getTasks(req, res) {
  try {
    // Tasks resolved more than 24 hours ago should not appear.
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const tasks = await Task.find({
      $or: [
        { status: { $ne: "resolved" } },
        { status: "resolved", completed_date: { $gte: twentyFourHoursAgo } },
      ],
    })
      .populate("assigned_to", "first_name last_name email")
      .populate("assigned_by", "first_name last_name email")
      .populate("created_by", "first_name last_name email")
      .populate("node_id", "node_id location")
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get tasks assigned to current worker
// Resolved alerts older than 24 hours are excluded.
export async function getMyTasks(req, res) {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const tasks = await Task.find({
      assigned_to: req.user._id,
      $or: [
        { status: { $ne: "resolved" } },
        { status: "resolved", completed_date: { $gte: twentyFourHoursAgo } },
      ],
    })
      .populate("assigned_to", "first_name last_name email")
      .populate("assigned_by", "first_name last_name email")
      .populate("created_by", "first_name last_name email")
      .populate("node_id", "node_id location")
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get task by ID
export async function getTaskById(req, res) {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assigned_to", "first_name last_name email")
      .populate("assigned_by", "first_name last_name email")
      .populate("created_by", "first_name last_name email")
      .populate("node_id", "node_id location");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Create task (Admin only)
export async function createTask(req, res) {
  try {
    const { task_id, title, description, assigned_to, node_id, priority } =
      req.body;

    if (!task_id || !title || !description || !node_id) {
      return res.status(400).json({
        message: "Task ID, title, description, and node ID are required",
      });
    }

    const existingTask = await Task.findOne({ task_id });
    if (existingTask) {
      return res
        .status(400)
        .json({ message: "Task with this ID already exists" });
    }

    const task = await Task.create({
      task_id,
      title,
      description,
      assigned_to: normalizeAssignedTo(assigned_to),
      created_by: req.user._id,
      assigned_by: req.user._id,
      node_id,
      priority: priority || "medium",
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assigned_to", "first_name last_name email")
      .populate("assigned_by", "first_name last_name email")
      .populate("created_by", "first_name last_name email")
      .populate("node_id", "node_id location");

    await createActivityLog({
      task_id: task._id,
      user_id: req.user._id,
      node_id,
      assigned_to: getAssignedToForLog(task),
      action: "created",
      description: `Task "${title}" was created by ${req.user.first_name} ${req.user.last_name}`,
      new_status: task.status,
    });

    emitTaskUpdate(req.app.get("io"), populatedTask);

    res
      .status(201)
      .json({ message: "Task created successfully", task: populatedTask });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Accept task (Worker)
export async function acceptTask(req, res) {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if task is assigned to this worker
    if (!isTaskAssignedToUser(task, req.user.userId)) {
      return res
        .status(403)
        .json({ message: "This task is not assigned to you" });
    }

    if (task.status !== "pending") {
      return res.status(400).json({ message: "Task is not in pending status" });
    }

    task.status = "ongoing";
    await task.save();

    res.status(200).json({ message: "Task accepted", task });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Update task status
export async function updateTaskStatus(req, res) {
  try {
    const { status } = req.body;

    if (!["pending", "ongoing", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Workers can only update their own assigned tasks
    if (
      req.user.role === "worker" &&
      !isTaskAssignedToUser(task, req.user.userId)
    ) {
      return res
        .status(403)
        .json({ message: "You can only update your own tasks" });
    }

    task.status = status;
    if (status === "resolved") {
      task.completed_date = new Date();
    }

    await task.save();
    await task.populate("node_id", "node_id location");

    emitTaskUpdate(req.app.get("io"), task);

    res.status(200).json({ message: "Task status updated", task });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Delete task (Admin only)
export async function deleteTask(req, res) {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Delegate task to another worker (Admin only)
export async function delegateTask(req, res) {
  try {
    const assignedTo = normalizeAssignedTo(req.body.assigned_to);

    if (!assignedTo.length) {
      return res.status(400).json({ message: "At least one worker ID is required" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        assigned_to: assignedTo,
        assigned_by: req.user._id,
        status: "pending",
      },
      { new: true },
    )
      .populate("assigned_to", "first_name last_name email")
      .populate("assigned_by", "first_name last_name email")
      .populate("created_by", "first_name last_name email")
      .populate("node_id", "node_id location");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Try to create activity log, but don't fail the delegate if it fails
    try {
      if (task.node_id) {
        const nodeId = task.node_id._id || task.node_id;
        await createActivityLog({
          task_id: task._id,
          user_id: req.user._id,
          node_id: nodeId,
          assigned_to: getAssignedToForLog(task),
          action: "assigned",
          description: `Task "${task.title}" was assigned by ${req.user.first_name} ${req.user.last_name}`,
          previous_status: task.status,
          new_status: "pending",
        });
      }
    } catch (logErr) {
      console.warn("Could not create activity log:", logErr.message);
    }

    emitTaskUpdate(req.app.get("io"), task);

    res.status(200).json({ message: "Task delegated successfully", task });
  } catch (err) {
    console.error("Error in delegateTask:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}
