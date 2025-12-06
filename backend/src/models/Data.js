import mongoose from "mongoose";

const DataSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  flow_rate: Number,
  water_level: Number,
  distance: Number,
  rain: Number,
  label: Number, // 0,1,2
});

const Data = mongoose.model("Data", DataSchema);

export default Data;
