import mongoose from "mongoose";

const maintenanceLogSchema = new mongoose.Schema(
  {
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    worker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    node_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Node",
      required: true,
    },
    action_taken: {
      type: String,
      required: true,
    },
    parts_replaced: [
      {
        type: String,
      },
    ],
    notes: {
      type: String,
    },
    images: [
      {
        type: String, // URLs to images
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("MaintenanceLog", maintenanceLogSchema);
