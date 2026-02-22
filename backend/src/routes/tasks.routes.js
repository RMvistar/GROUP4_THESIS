import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/role.middleware.js";
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

const router = express.Router();

// Admin routes
router.get("/", verifyToken, checkRole(["super-admin", "admin"]), getTasks);
router.post("/", verifyToken, checkRole(["super-admin", "admin"]), createTask);
router.delete(
  "/:id",
  verifyToken,
  checkRole(["super-admin", "admin"]),
  deleteTask,
);
router.patch(
  "/:id/delegate",
  verifyToken,
  checkRole(["super-admin", "admin"]),
  delegateTask,
);

// Worker routes
router.get("/my-tasks", verifyToken, checkRole(["worker"]), getMyTasks);
router.patch("/:id/accept", verifyToken, checkRole(["worker"]), acceptTask);

// Shared routes (Admin and Worker)
router.get(
  "/:id",
  verifyToken,
  checkRole(["super-admin", "admin", "worker"]),
  getTaskById,
);
router.patch(
  "/:id/status",
  verifyToken,
  checkRole(["super-admin", "admin", "worker"]),
  updateTaskStatus,
);

export default router;
