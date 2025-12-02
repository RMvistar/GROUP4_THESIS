import { getData } from "../controllers/dataController.js";
import { postData } from "../controllers/dataController.js";
import express from "express";

const router = express.Router();
router.get("/", getData);
router.post("/", postData);
export default router;
