/**
 * fixUserRoles.js
 * Fix user role references - update all admin/super admin users to have the new Admin role.
 * Usage: node src/utils/fixUserRoles.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../Config/db.js";
import Role from "../models/Role.js";
import User from "../models/User.js";

dotenv.config();

async function fixUserRoles() {
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

    // Get all users with their role IDs
    const allUsers = await User.find({}, { username: 1, role: 1, first_name: 1, last_name: 1 });
    console.log(`\nTotal users: ${allUsers.length}`);
    
    // Update users without roles
    const usersWithoutRole = allUsers.filter((u) => !u.role);
    console.log(`Users without roles: ${usersWithoutRole.length}`);
    
    if (usersWithoutRole.length > 0) {
      const result = await User.updateMany(
        { role: { $exists: false } },
        { $set: { role: adminRole._id } }
      );
      console.log(`✓ Assigned Admin role to ${result.modifiedCount} users without roles`);
    }

    // Verify the updates
    const updatedUsers = await User.find().populate("role");
    console.log(`\nUpdated user roles:`);
    for (const user of updatedUsers) {
      const roleName = user.role?.name || "No Role";
      console.log(`  - ${user.username}: ${roleName}`);
    }

    console.log("\nUser role fix complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

fixUserRoles();
