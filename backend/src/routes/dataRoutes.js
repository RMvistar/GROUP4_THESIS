import {
  getData,
  postData,
  getLatestData,
  updateAlertStatus,
} from "../controllers/dataController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();
// Admin-only routes - requires valid token
router.get("/export", verifyToken, getData);
router.patch("/alert-status/:id", verifyToken, updateAlertStatus);
// Public routes - no authentication needed for guests
router.get("/latest", getLatestData);
router.post("/", postData);

export default router;
