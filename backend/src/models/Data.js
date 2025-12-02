import mongoose from "mongoose";

const DataSchema = new mongoose.Schema(
  {
    sensor_id: { type: String, required: true },
    value1: { type: Number, default: 0 },
    value2: { type: Number, default: 0 },
    value3: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const Data = mongoose.model("Data", DataSchema);

export default Data;
