import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/rbac.middleware.js";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/roles.controller.js";

const router = express.Router();

router.get("/", getRoles);
router.post("/", verifyToken, requirePermission("MANAGE_ROLES"), createRole);
router.put("/:id", verifyToken, requirePermission("MANAGE_ROLES"), updateRole);
router.delete(
  "/:id",
  verifyToken,
  requirePermission("MANAGE_ROLES"),
  deleteRole,
);

export default router;
