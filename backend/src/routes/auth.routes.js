import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { register, login, getUsers } from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

export default router;
