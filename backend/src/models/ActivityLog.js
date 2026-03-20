import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    task_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    node_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Node",
      required: true,
    },
    assigned_to: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    action: {
      type: String,
      enum: ["acknowledged", "resolved", "assigned", "created"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    previous_status: {
      type: String,
    },
    new_status: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
