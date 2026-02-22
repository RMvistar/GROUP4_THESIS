import Data from "../models/Data.js";

export async function getData(req, res) {
  try {
    const data = await Data.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function postData(req, res) {
  try {
    // Check if data is from ESP (has mac and data fields)
    if (req.body.mac && req.body.data) {
      const { mac, data, timestamp } = req.body;

      // Transform ESP data to backend format
      const flow_rate = data.velocity || 0;
      const water_level = data.ultrasonic || 0;
      const distance = data.tof || 0;

      // Calculate status based on readings
      let status = 0; // Normal
      const NORMAL_LEVEL = 200;
      const AT_RISK_LEVEL = 150;
      const CLOGGED_LEVEL = 100;

      if (water_level > NORMAL_LEVEL && flow_rate < 10) {
        status = 0; // Normal
      } else if (water_level <= NORMAL_LEVEL && water_level > AT_RISK_LEVEL) {
        status = 1; // At Risk
      } else if (water_level <= AT_RISK_LEVEL && flow_rate < 5) {
        status = 2; // Clogged
      } else if (water_level <= CLOGGED_LEVEL) {
        status = 3; // Overflow
      }

      const newData = new Data({
        sensor_id: mac,
        flow_rate,
        water_level,
        status,
        delta_water_level: 0,
        distance,
        rain: 0,
        batteryVoltage: data.batteryVoltage,
        batteryPercent: data.batteryPercent,
        timestamp: timestamp || new Date(),
      });

      const savedData = await newData.save();
      console.log("✅ ESP data saved:", savedData);
      return res.status(201).json(savedData);
    }

    // Original format (for backward compatibility)
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

export async function getAlertStatus(req, res) {
  try {
    // Fetch same alert data as admin and guests
    const data = await Data.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching alert data:", error);
    res.status(500).json({ message: "Server Error" });
  }
}

export async function updateAlertStatus(req, res) {
  try {
    const { id } = req.params;
    const { alertStatus } = req.body;

    if (!["unresolved", "ongoing", "resolved"].includes(alertStatus)) {
      return res.status(400).json({ message: "Invalid alert status" });
    }

    const updatedData = await Data.findByIdAndUpdate(
      id,
      { alertStatus },
      { new: true },
    );

    if (!updatedData) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.status(200).json(updatedData);
  } catch (error) {
    console.error("Error updating alert status:", error);
    res.status(500).json({ message: "Server Error" });
  }
}
