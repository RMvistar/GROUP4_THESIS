import {
  getData,
  postData,
  getLatestData,
  getAlertStatus,
  updateAlertStatus,
} from "../controllers/dataController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();
// Admin lang na mga routes
router.get("/export", verifyToken, getData);
router.patch("/alert-status/:id", verifyToken, updateAlertStatus);
// Public na mga  routes
router.get("/alerts", getAlertStatus);
router.get("/latest", getLatestData);
router.post("/", postData);

export default router;
