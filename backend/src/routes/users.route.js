import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/rbac.middleware.js";
import {
  getUsers,
  getUserId,
  CreateUser,
  putUserId,
  deleteUser,
  deleteUserId,
} from "../controllers/users.controller.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", verifyToken, requirePermission("MANAGE_USERS"), getUserId);
router.post("/CreateUser", CreateUser);
router.put("/:id", putUserId);
router.delete("/", deleteUser);
router.delete(
  "/:id",
  verifyToken,
  requirePermission("MANAGE_USERS"),
  deleteUserId,
);

export default router;
