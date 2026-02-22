import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import {
  getUsers,
  getUserId,
  postUser,
  putUserId,
  deleteUser,
  deleteUserId,
} from "../controllers/users.controller.js";

const router = express.Router();

router.get("/", verifyToken, checkRole(["super-admin"]), getUsers);
router.get("/:id", verifyToken, checkRole(["super-admin"]), getUserId);
router.post("/", verifyToken, checkRole(["super-admin"]), postUser);
router.put("/:id", verifyToken, checkRole(["super-admin"]), putUserId);
router.delete("/", verifyToken, checkRole(["super-admin"]), deleteUser);
router.delete("/:id", verifyToken, checkRole(["super-admin"]), deleteUserId);

export default router;
