import express from "express";
import cors from "cors";
import dataRoutes from "./src/routes/dataRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import dotenv from "dotenv";
import { connectDB } from "./src/Config/db.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/data", dataRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5001;
connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
