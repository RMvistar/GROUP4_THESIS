import {
  getData,
  postData,
  getLatestData,
  getAlertStatus,
  updateAlertStatus,
} from "../controllers/data.controller.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/rbac.middleware.js";
import express from "express";

const router = express.Router();

// Sensor POST — no auth (called by hardware/IoT device)
router.post("/", postData);

// Protected routes
router.get("/export", verifyToken, requirePermission("VIEW_DATA"), getData);
router.get(
  "/latest",
  verifyToken,
  requirePermission("VIEW_DATA"),
  getLatestData,
);
router.get(
  "/alerts",
  verifyToken,
  requirePermission("VIEW_ALERTS"),
  getAlertStatus,
);
router.patch(
  "/alert-status/:id",
  verifyToken,
  requirePermission("VIEW_ALERTS"),
  updateAlertStatus,
);

export default router;
