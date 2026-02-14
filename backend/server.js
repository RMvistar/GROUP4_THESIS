import express from "express";
import cors from "cors";
import dataRoutes from "./src/routes/dataRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./src/Config/db.js";

dotenv.config();

const app = express();
const server = createServer(app);

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(" Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  // Add your custom socket events here
});

// Routes
app.use("/api/data", dataRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5001;

// Connect to DB and start server
connectDB();
server.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});

export { io };
