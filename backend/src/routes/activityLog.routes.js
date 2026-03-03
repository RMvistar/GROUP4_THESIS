import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/rbac.middleware.js";
import { getActivityLogs } from "../controllers/activityLog.controller.js";

const router = express.Router();

// Get all activity logs (Admin/Super Admin)
router.get(
  "/",
  verifyToken,
  requirePermission("MANAGE_TASKS"), // Or create a new permission
  getActivityLogs,
);

export default router;
