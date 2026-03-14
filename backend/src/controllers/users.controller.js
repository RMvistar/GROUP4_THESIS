import User from "../models/User.js";
import Role from "../models/Role.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  sendCredentialsEmail,
  sendPasswordResetEmail,
} from "../utils/mailer.js";

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
    // mustChangePassword: true forces the user to set their own password
    // the first time they visit Account Settings.
    const user = await User.create({
      first_name,
      last_name,
      username,
      email,
      password: hashedPassword,
      government_id,
      role: role || null,
      mustChangePassword: true,
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
      status,
    } = req.body;

    const updateData = {
      first_name,
      last_name,
      name,
      email,
      government_id,
      role,
      status,
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

// ─── Change own password (any authenticated user) ────────────────────────────
// Called from Account Settings. Verifies the current password, then saves the
// new one and clears the mustChangePassword flag so the banner goes away.
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    // req.user is set by verifyToken middleware — it is the logged-in user document.
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }

    // We need the password hash, so fetch WITHOUT the -password exclusion.
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // bcrypt.compare checks the plain-text password against the stored hash.
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash the new password before saving — NEVER store plain text.
    user.password = await bcrypt.hash(newPassword, 10);
    // Clear the flag — the user has now set their own password.
    user.mustChangePassword = false;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// ─── Reset a user's password (Super Admin only) ──────────────────────────────
// Generates a random temporary password, saves it, marks mustChangePassword,
// and emails the user so they can log in and set their own password.
export async function resetPassword(req, res) {
  try {
    const user = await User.findById(req.params.id).populate("role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // crypto.randomBytes(8) gives 8 random bytes → 16 lowercase hex characters.
    // This is the temporary password that will be sent to the user's email.
    const tempPassword = crypto.randomBytes(8).toString("hex");

    // Hash it before saving to the database.
    user.password = await bcrypt.hash(tempPassword, 10);
    // Force the user to choose a new password after they log in.
    user.mustChangePassword = true;
    await user.save();

    // Email the temporary password to the user.
    try {
      await sendPasswordResetEmail({
        to: user.email,
        firstName: user.first_name,
        username: user.username,
        newPassword: tempPassword,
      });
      console.log(`Password reset email sent to ${user.email}`);
    } catch (emailErr) {
      console.error("Password reset email failed:", emailErr.message);
    }

    res
      .status(200)
      .json({
        message:
          "Password reset successfully. An email has been sent to the user.",
      });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}
