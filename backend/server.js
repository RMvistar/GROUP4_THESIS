import express from "express";
import cors from "cors";
import dataRoutes from "./src/routes/dataRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import dotenv from "dotenv";
import { connectDB } from "./src/Config/db.js";

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/data", dataRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5001;
connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
