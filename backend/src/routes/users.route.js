import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/role.middleware.js";
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
router.get("/:id", getUserId);
router.post("/CreateUser", CreateUser);
router.put("/:id", putUserId);
router.delete("/", verifyToken, checkRole(["super-admin"]), deleteUser);
router.delete("/:id", deleteUserId);

export default router;
