import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/rbac.middleware.js";
import {
  getNodes,
  getNodeById,
  createNode,
  updateNode,
  updateNodeStatus,
  deleteNode,
} from "../controllers/nodes.controller.js";

const router = express.Router();

router.get("/", verifyToken, requirePermission("MANAGE_NODES"), getNodes);
router.get("/:id", verifyToken, requirePermission("MANAGE_NODES"), getNodeById);
router.post("/", verifyToken, requirePermission("MANAGE_NODES"), createNode);
router.put("/:id", verifyToken, requirePermission("MANAGE_NODES"), updateNode);
router.patch(
  "/:id/status",
  verifyToken,
  requirePermission("MANAGE_NODES"),
  updateNodeStatus,
);
router.delete(
  "/:id",
  verifyToken,
  requirePermission("MANAGE_NODES"),
  deleteNode,
);

export default router;
