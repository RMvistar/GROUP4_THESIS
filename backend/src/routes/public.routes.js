import express from "express";
import {
  getFloodRiskInfo,
  getOverflowPredictions,
  getPublicNodeDetails,
  getNodeHistoricalData,
  getActiveNodes,
  getPublicAlerts,
  getRecentPredictions,
} from "../controllers/public.controller.js";

const router = express.Router();

// Public routes
router.get("/flood-risk", getFloodRiskInfo);
router.get("/overflow-predictions", getOverflowPredictions);
router.get("/nodes", getActiveNodes);
router.get("/nodes/:nodeId", getPublicNodeDetails);
router.get("/nodes/:nodeId/history", getNodeHistoricalData);
router.get("/alerts", getPublicAlerts);
router.get("/predictions", getRecentPredictions);

export default router;
