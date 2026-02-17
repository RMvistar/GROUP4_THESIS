import mongoose from "mongoose";

const dataSchema = new mongoose.Schema(
  {
    sensor_id: {
      type: String,
      default: "DRAINAGE_SENSOR_01",
    },
    flow_rate: {
      type: Number,
      required: true,
    },
    water_level: {
      type: Number,
      required: true,
    },
    status: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3], // 0-Normal, 1-At Risk, 2-Clogged, 3-Overflow
    },
    alertStatus: {
      type: String,
      enum: ["unresolved", "ongoing", "resolved"],
      default: "unresolved",
    },
    // Store additional data for records
    delta_water_level: Number,
    distance: Number,
    rain: Number,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Data", dataSchema);
