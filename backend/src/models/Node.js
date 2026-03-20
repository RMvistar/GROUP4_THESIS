import mongoose from "mongoose";

const nodeSchema = new mongoose.Schema(
  {
    node_id: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
    sensor_id: {
      type: String,
      required: true,
    },
    is_claimed: {
      type: Boolean,
      default: true,
    },
    claimed_at: {
      type: Date,
    },
    installed_date: {
      type: Date,
      default: Date.now,
    },
    last_maintenance: {
      type: Date,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    description: String,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Node", nodeSchema);
