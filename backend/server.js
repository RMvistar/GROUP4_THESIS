import express from "express";
import dataRoutes from "./src/routes/dataRoutes.js";
import dotenv from "dotenv";
import { connectDB } from "./src/Config/db.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/data", dataRoutes);

const PORT = process.env.PORT || 5000;
connectDB();
app.listen(PORT, () => {
  console.log("Server is running on port 5000");
});
