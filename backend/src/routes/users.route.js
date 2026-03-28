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
  changePassword,
  resetPassword,
} from "../controllers/users.controller.js";

const router = express.Router();

// ── Static routes must come BEFORE /:id so they are not swallowed as params ──

// Any logged-in user can change their own password via Account Settings.
router.patch("/change-password", verifyToken, changePassword);

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

// Admin resets another user's password and sends them an email.
router.post(
  "/:id/reset-password",
  verifyToken,
  requirePermission("MANAGE_USERS"),
  resetPassword,
);

export default router;
