import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/role.middleware.js";
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

// Admin routes
router.get(
  "/",
  verifyToken,
  checkRole(["super-admin", "admin"]),
  getMaintenanceLogs,
);
router.get(
  "/node/:nodeId",
  verifyToken,
  checkRole(["super-admin", "admin"]),
  getLogsByNode,
);
router.get(
  "/worker/:workerId",
  verifyToken,
  checkRole(["super-admin", "admin"]),
  getLogsByWorker,
);
router.get(
  "/download",
  verifyToken,
  checkRole(["super-admin", "admin"]),
  downloadLogs,
);
router.delete(
  "/:id",
  verifyToken,
  checkRole(["super-admin", "admin"]),
  deleteLog,
);

// Worker routes
router.get("/my-logs", verifyToken, checkRole(["worker"]), getMyLogs);
router.post("/", verifyToken, checkRole(["worker"]), createMaintenanceLog);

// Shared na mga rouites sang Admin kag Worker
router.get(
  "/:id",
  verifyToken,
  checkRole(["super-admin", "admin", "worker"]),
  getLogById,
);

export default router;
