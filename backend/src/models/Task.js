import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    task_id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    node_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Node",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "ongoing", "resolved"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    created_date: {
      type: Date,
      default: Date.now,
    },
    completed_date: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Task", taskSchema);
