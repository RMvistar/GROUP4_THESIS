import Data from "../models/Data.js";

export async function getData(req, res) {
  try {
    const data = await Data.find().sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function postData(req, res) {
  try {
    const {
      flow_rate,
      water_level,
      status,
      delta_water_level,
      distance,
      rain,
      timestamp,
    } = req.body;

    // Validate status value
    if (![0, 1, 2, 3].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const newData = new Data({
      flow_rate,
      water_level,
      status,
      delta_water_level,
      distance,
      rain,
      timestamp: timestamp || new Date(),
    });

    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function getLatestData(req, res) {
  try {
    const latestData = await Data.findOne().sort({ createdAt: -1 });
    res.status(200).json(latestData);
  } catch (error) {
    console.error("Error fetching latest data:", error);
    res.status(500).json({ message: "Server Error" });
  }
}
