import {
  getData,
  postData,
  getLatestData,
} from "../controllers/dataController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();
// Protected routes - requires valid token
router.get("/export", verifyToken, getData);
router.get("/latest", verifyToken, getLatestData);
router.post("/", postData);

export default router;
