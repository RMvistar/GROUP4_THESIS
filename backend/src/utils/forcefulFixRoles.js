/**
 * forcefulFixRoles.js
 * Force update all users without valid role references to use Admin role.
 * Usage: node src/utils/forcefulFixRoles.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../Config/db.js";
import Role from "../models/Role.js";
import User from "../models/User.js";

dotenv.config();

async function forcefulFixRoles() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Get the new role IDs
    const adminRole = await Role.findOne({ name: "Admin" });
    if (!adminRole) {
      console.error("Admin role not found!");
      process.exit(1);
    }

    console.log(`Admin role ID: ${adminRole._id}`);

    // Get all users (raw, without population)
    const allUsersRaw = await User.find();
    console.log(`\nTotal users (raw): ${allUsersRaw.length}`);

    // Check which users have invalid/missing role references
    const usersToFix = [];
    for (const user of allUsersRaw) {
      if (!user.role || user.role.toString() === "") {
        usersToFix.push(user);
        console.log(`  ✗ ${user.username}: role is ${user.role || "missing"}`);
      } else {
        console.log(`  ✓ ${user.username}: role ID is ${user.role}`);
      }
    }

    console.log(`\nUsers to fix: ${usersToFix.length}`);

    // Fix all users without valid roles
    const result = await User.updateMany(
      { $or: [{ role: null }, { role: "" }, { role: { $exists: false } }] },
      { $set: { role: adminRole._id } }
    );
    console.log(`Updated ${result.modifiedCount} users`);

    // Verify the fixes
    console.log("\nVerifying updated users:");
    const verifyUsers = await User.find().populate("role");
    for (const user of verifyUsers) {
      const roleName = user.role?.name || "No Role (ERROR!)";
      console.log(`  - ${user.username}: ${roleName}`);
    }

    console.log("\nRole fix complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

forcefulFixRoles();
