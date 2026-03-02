import User from "../models/User.js";
import Role from "../models/Role.js";
import bcrypt from "bcryptjs";
import { sendCredentialsEmail } from "../utils/mailer.js";

// Get all users (Super Admin only)
export async function getUsers(req, res) {
  try {
    const users = await User.find().select("-password").populate("role");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Get user by ID
export async function getUserId(req, res) {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Create user (Super Admin )
export async function CreateUser(req, res) {
  try {
    const {
      first_name,
      last_name,
      username,
      email,
      password,
      government_id,
      role,
    } = req.body;

    if (!first_name || !last_name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!government_id) {
      return res.status(400).json({ message: "Government ID is required" });
    }

    const exist = await User.findOne({
      $or: [{ government_id }, { email }, { username }],
    });
    if (exist) {
      let message = "User already exists";

      if (exist.government_id === government_id) {
        message = "Government ID already exists";
      } else if (exist.email === email) {
        message = "Email already exists";
      } else if (exist.username === username) {
        message = "Username already exists";
      }

      return res.status(400).json({ message });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // role from req.body should be a Role ObjectId
    const user = await User.create({
      first_name,
      last_name,
      username,
      email,
      password: hashedPassword,
      government_id,
      role: role || null,
    });

    // Resolve role name for the credentials email
    let roleName = "Unknown";
    if (role) {
      const roleDoc = await Role.findById(role);
      roleName = roleDoc?.name || "Unknown";
    }

    // Send credentials email (non-blocking — user creation still succeeds if email fails)
    try {
      await sendCredentialsEmail({
        to: email,
        firstName: first_name,
        username,
        password, // plain-text — captured before hashing above
        role: roleName,
      });
      console.log(`Credentials email sent to ${email}`);
    } catch (emailErr) {
      console.error("Credentials email failed:", emailErr.message);
      console.error(emailErr);
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res
      .status(201)
      .json({ message: "User created successfully", user: userResponse });
  } catch (err) {
    if (err?.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern || {})[0];
      const fieldMap = {
        email: "Email",
        government_id: "Government ID",
        username: "Username",
      };

      return res.status(400).json({
        message: `${fieldMap[duplicateField] || "Field"} already exists`,
      });
    }

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
