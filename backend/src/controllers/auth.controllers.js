import User from "../models/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const register = async (req, res) => {
  try {
    const { first_name, last_name, name, email, password, role } = req.body;

    console.log("Register request received:", {
      first_name,
      last_name,
      name,
      email,
      role,
    });

    if (!first_name || !last_name || !name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      first_name,
      last_name,
      name,
      email,
      password: hashedPassword,
      role: role || "user", // Default to "user" if not specified
    });

    console.log("User created successfully:", newUser._id);
    res.status(201).json({ message: "Registration successful!" });
  } catch (err) {
    console.error("Error during registration:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// diri na ang login yey
export const login = async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await User.findOne({ username: name }).populate("role");
    if (!user)
      return res.status(400).json({ message: "Your Credentials are invalid!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Your Credentials are invalid!" });

    // JWT only embeds id — verifyToken always fetches role from DB
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        role: user.role?.name || "user", // Return role name string, not the object
        // Tell the frontend whether this is a temporary password the user must change.
        mustChangePassword: user.mustChangePassword || false,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
