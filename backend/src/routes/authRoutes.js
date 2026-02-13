import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { register, login, getUsers } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", verifyToken, getUsers);

export default router;
