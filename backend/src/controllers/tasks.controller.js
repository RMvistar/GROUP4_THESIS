import Task from "../models/Task.js";

// Get all tasks (Admin)
export async function getTasks(req, res) {
  try {
    const tasks = await Task.find()
      .populate("assigned_to", "first_name last_name email")
      .populate("created_by", "first_name last_name email")
      .populate("node_id", "node_id location")
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get tasks assigned to current worker
export async function getMyTasks(req, res) {
  try {
    const tasks = await Task.find({ assigned_to: req.user.userId })
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
      return res
        .status(400)
        .json({
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
      assigned_to,
      created_by: req.user.userId,
      node_id,
      priority: priority || "medium",
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assigned_to", "first_name last_name email")
      .populate("node_id", "node_id location");

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
    if (task.assigned_to.toString() !== req.user.userId) {
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
      task.assigned_to.toString() !== req.user.userId
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
    const { assigned_to } = req.body;

    if (!assigned_to) {
      return res.status(400).json({ message: "Worker ID is required" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { assigned_to, status: "pending" },
      { new: true },
    ).populate("assigned_to", "first_name last_name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task delegated successfully", task });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}
