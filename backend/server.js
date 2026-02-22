import express from "express";
import cors from "cors";
import dataRoutes from "./src/routes/data.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import usersRoutes from "./src/routes/users.route.js";
import nodesRoutes from "./src/routes/nodes.routes.js";
import tasksRoutes from "./src/routes/tasks.routes.js";
import maintenanceRoutes from "./src/routes/maintenance.routes.js";
import publicRoutes from "./src/routes/public.routes.js";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./src/Config/db.js";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5001;
const VITE_PORT = process.env.VITE_PORT || 5173;
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
});

app.use("/api/data", dataRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/nodes", nodesRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/public", publicRoutes);

connectDB();
server.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});

export { io };
