import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  requirePermission,
  requireAnyPermission,
} from "../middleware/rbac.middleware.js";
import {
  getTasks,
  getMyTasks,
  getTaskById,
  createTask,
  acceptTask,
  updateTaskStatus,
  deleteTask,
  delegateTask,
} from "../controllers/tasks.controller.js";

import {
  acknowledgeTask,
  resolveTask,
} from "../controllers/tasks.controller.js";

const router = express.Router();

router.patch(
  "/:id/acknowledge",
  verifyToken,
  requireAnyPermission(["MANAGE_TASKS", "ASSIGN_TASKS"]),
  acknowledgeTask,
);

router.patch(
  "/:id/resolve",
  verifyToken,
  requireAnyPermission(["MANAGE_TASKS", "ASSIGN_TASKS"]),
  resolveTask,
);

// Admin routes (MANAGE_TASKS)
router.get("/", verifyToken, requirePermission("MANAGE_TASKS"), getTasks);
router.post("/", verifyToken, requirePermission("MANAGE_TASKS"), createTask);
router.delete(
  "/:id",
  verifyToken,
  requirePermission("MANAGE_TASKS"),
  deleteTask,
);
router.patch(
  "/:id/delegate",
  verifyToken,
  requirePermission("MANAGE_TASKS"),
  delegateTask,
);

// Worker routes (ASSIGN_TASKS)
router.get(
  "/my-tasks",
  verifyToken,
  requirePermission("ASSIGN_TASKS"),
  getMyTasks,
);
router.patch(
  "/:id/accept",
  verifyToken,
  requirePermission("ASSIGN_TASKS"),
  acceptTask,
);

// Shared routes (Admin OR Worker)
router.get(
  "/:id",
  verifyToken,
  requireAnyPermission("MANAGE_TASKS", "ASSIGN_TASKS"),
  getTaskById,
);
router.patch(
  "/:id/status",
  verifyToken,
  requireAnyPermission("MANAGE_TASKS", "ASSIGN_TASKS"),
  updateTaskStatus,
);

export default router;
