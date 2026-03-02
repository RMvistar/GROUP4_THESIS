import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  requirePermission,
  requireAnyPermission,
} from "../middleware/rbac.middleware.js";
import {
  getMaintenanceLogs,
  getLogsByNode,
  getLogsByWorker,
  getMyLogs,
  createMaintenanceLog,
  getLogById,
  downloadLogs,
  deleteLog,
} from "../controllers/maintenance.controller.js";

const router = express.Router();

// Admin routes (MANAGE_NODES)
router.get(
  "/",
  verifyToken,
  requirePermission("MANAGE_NODES"),
  getMaintenanceLogs,
);
router.get(
  "/node/:nodeId",
  verifyToken,
  requirePermission("MANAGE_NODES"),
  getLogsByNode,
);
router.get(
  "/worker/:workerId",
  verifyToken,
  requirePermission("MANAGE_NODES"),
  getLogsByWorker,
);
router.get(
  "/download",
  verifyToken,
  requirePermission("MANAGE_NODES"),
  downloadLogs,
);
router.delete(
  "/:id",
  verifyToken,
  requirePermission("MANAGE_NODES"),
  deleteLog,
);

// Worker routes (ASSIGN_TASKS)
router.get(
  "/my-logs",
  verifyToken,
  requirePermission("ASSIGN_TASKS"),
  getMyLogs,
);
router.post(
  "/",
  verifyToken,
  requirePermission("ASSIGN_TASKS"),
  createMaintenanceLog,
);

// Shared routes (Admin OR Worker)
router.get(
  "/:id",
  verifyToken,
  requireAnyPermission("MANAGE_NODES", "ASSIGN_TASKS"),
  getLogById,
);

export default router;
