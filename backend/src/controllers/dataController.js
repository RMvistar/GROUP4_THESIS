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
    const { sensor_id, value1, value2, value3 } = req.body;
    const newData = new Data({ sensor_id, value1, value2, value3 });
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: "Server Error" });
  }
}
