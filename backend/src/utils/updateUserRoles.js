/**
 * updateUserRoles.js
 * Update user role references to point to the new role IDs.
 * Usage: node src/utils/updateUserRoles.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../Config/db.js";
import Role from "../models/Role.js";
import User from "../models/User.js";

dotenv.config();

async function updateUserRoles() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Get the new role IDs
    const adminRole = await Role.findOne({ name: "Admin" });
    const powerUserRole = await Role.findOne({ name: "PowerUser" });
    const workerRole = await Role.findOne({ name: "Worker" });

    if (!adminRole || !powerUserRole || !workerRole) {
      console.error("One or more roles not found!");
      process.exit(1);
    }

    console.log(`Admin role ID: ${adminRole._id}`);
    console.log(`PowerUser role ID: ${powerUserRole._id}`);
    console.log(`Worker role ID: ${workerRole._id}`);

    // Get all users and display their current roles
    const users = await User.find().populate("role");
    console.log(`\nTotal users: ${users.length}`);
    console.log("\nCurrent user roles:");
    
    for (const user of users) {
      const roleName = user.role?.name || "No Role";
      console.log(`  - ${user.username} (${user.first_name} ${user.last_name}): ${roleName}`);
    }

    // Update users with null roles or roles that don't exist
    const usersToUpdate = users.filter((u) => !u.role || !u.role._id);
    console.log(`\nUsers needing role assignment: ${usersToUpdate.length}`);

    // Assign Admin role to users without a role (optional - remove if not desired)
    if (usersToUpdate.length > 0) {
      const result = await User.updateMany(
        { role: null },
        { $set: { role: adminRole._id } }
      );
      console.log(`Updated ${result.modifiedCount} users to Admin role`);
    }

    console.log("\nUser role update complete!");
    process.exit(0);
  } catch (err) {
    console.error("Update error:", err);
    process.exit(1);
  }
}

updateUserRoles();
