import mongoose from "mongoose";

const dataSchema = new mongoose.Schema(
  {
    sensor_id: {
      type: String,
      default: "DRAINAGE_Module_01",
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
    batteryVoltage: Number,
    batteryPercent: Number,
    // ML prediction fields (populated when Python ML script posts results)
    ml_label: { type: Number, min: 0, max: 4 },
    ml_state: { type: String },
    rate_of_change: { type: Number },
    estimated_time_to_overflow_s: { type: Number },
    estimated_time_to_overflow_min: { type: Number },
    estimated_time_to_at_risk_s: { type: Number },
    estimated_time_to_at_risk_min: { type: Number },
    class_probabilities: { type: Object },
    samples_aggregated: { type: Number },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Data", dataSchema);
