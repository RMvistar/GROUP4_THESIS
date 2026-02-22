import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Get all users (Super Admin only)
export async function getUsers(req, res) {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get user by ID
export async function getUserId(req, res) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Create user (Super Admin )
export async function postUser(req, res) {
  try {
    const {
      first_name,
      last_name,
      name,
      email,
      password,
      government_id,
      role,
    } = req.body;

    if (!first_name || !last_name || !name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      name,
      email,
      password: hashedPassword,
      government_id,
      role: role || "public-user",
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res
      .status(201)
      .json({ message: "User created successfully", user: userResponse });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Update user by ID
export async function putUserId(req, res) {
  try {
    const {
      first_name,
      last_name,
      name,
      email,
      government_id,
      role,
      password,
    } = req.body;

    const updateData = {
      first_name,
      last_name,
      name,
      email,
      government_id,
      role,
    };

    // Only hash password if it's being updated
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Delete all users
export async function deleteUser(req, res) {
  try {
    await User.deleteMany({});
    res.status(200).json({ message: "All users deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Delete user by ID
export async function deleteUserId(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}
