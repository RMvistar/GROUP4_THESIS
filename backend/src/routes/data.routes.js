import {
  getData,
  postData,
  getLatestData,
  getAlertStatus,
  updateAlertStatus,
} from "../controllers/data.controller.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

router.get("/export", getData);
router.patch("/alert-status/:id", verifyToken, updateAlertStatus);

router.get("/alerts", getAlertStatus);
router.get("/latest", getLatestData);
router.post("/", postData);

export default router;
