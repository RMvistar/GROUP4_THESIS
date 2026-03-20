import Role from "../models/Role.js";

export async function getRoles(req, res) {
  try {
    const roles = await Role.find({ name: { $ne: "Public User" } }).sort({
      createdAt: -1,
    });
    res.status(200).json(roles);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}
