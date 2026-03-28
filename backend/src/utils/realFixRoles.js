/**
 * realFixRoles.js
 * Properly update all user role references to valid new role IDs.
 * Usage: node src/utils/realFixRoles.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../Config/db.js";
import Role from "../models/Role.js";
import User from "../models/User.js";

dotenv.config();

async function realFixRoles() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Get the new valid role IDs
    const adminRole = await Role.findOne({ name: "Admin" });
    const powerUserRole = await Role.findOne({ name: "PowerUser" });
    const workerRole = await Role.findOne({ name: "Worker" });

    if (!adminRole || !powerUserRole || !workerRole) {
      console.error("One or more required roles not found!");
      process.exit(1);
    }

    console.log(`Valid roles in database:`);
    console.log(`  Admin: ${adminRole._id}`);
    console.log(`  PowerUser: ${powerUserRole._id}`);
    console.log(`  Worker: ${workerRole._id}`);

    // Get all roles to identify old/invalid ones
    const allRoles = await Role.find();
    const validRoleIds = [
      adminRole._id.toString(),
      powerUserRole._id.toString(),
      workerRole._id.toString(),
    ];

    console.log(`\nAll roles in database:`);
    for (const role of allRoles) {
      const isValid = validRoleIds.includes(role._id.toString());
      const status = isValid ? "✓" : "✗";
      console.log(`  ${status} ${role.name}: ${role._id}`);
    }

    // Get all users and identify those with invalid role references
    const allUsers = await User.find();
    console.log(`\nAll users in database:`);
    
    const usersWithInvalidRoles = [];
    for (const user of allUsers) {
      const userRoleId = user.role?.toString() || "null";
      const isValid = validRoleIds.includes(userRoleId);
      const status = isValid ? "✓" : "✗";
      
      if (!isValid) {
        usersWithInvalidRoles.push(user._id);
      }
      
      console.log(`  ${status} ${user.username}: ${userRoleId}`);
    }

    // Update users with invalid role references to Admin
    if (usersWithInvalidRoles.length > 0) {
      console.log(`\nUpdating ${usersWithInvalidRoles.length} users with invalid roles...`);
      const result = await User.updateMany(
        { _id: { $in: usersWithInvalidRoles } },
        { $set: { role: adminRole._id } }
      );
      console.log(`✓ Updated ${result.modifiedCount} users`);
    }

    // Verify the fixes
    console.log("\nVerifying all users after fix:");
    const verifiedUsers = await User.find().populate("role");
    for (const user of verifiedUsers) {
      const roleName = user.role?.name || "No Role";
      const roleStatus = user.role ? "✓" : "✗";
      console.log(`  ${roleStatus} ${user.username}: ${roleName}`);
    }

    console.log("\n✓ Role fix complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

realFixRoles();
