import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import {
  getNodes,
  getNodeById,
  createNode,
  updateNode,
  updateNodeStatus,
  deleteNode,
} from "../controllers/nodes.controller.js";

const router = express.Router();

// Admin only routes
router.get("/", verifyToken, checkRole(["super-admin", "admin"]), getNodes);
router.get(
  "/:id",
  verifyToken,
  checkRole(["super-admin", "admin"]),
  getNodeById,
);
router.post("/", verifyToken, checkRole(["super-admin", "admin"]), createNode);
router.put(
  "/:id",
  verifyToken,
  checkRole(["super-admin", "admin"]),
  updateNode,
);
router.patch(
  "/:id/status",
  verifyToken,
  checkRole(["super-admin", "admin"]),
  updateNodeStatus,
);
router.delete(
  "/:id",
  verifyToken,
  checkRole(["super-admin", "admin"]),
  deleteNode,
);

export default router;
