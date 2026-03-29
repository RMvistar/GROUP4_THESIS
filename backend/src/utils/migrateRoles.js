/**
 * migrateRoles.js
 * Migrate old role names (Super Admin -> Admin, Admin -> PowerUser) in the database.
 * Usage: node src/utils/migrateRoles.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../Config/db.js";
import Role from "../models/Role.js";
import User from "../models/User.js";

dotenv.config();

async function migrate() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Step 1: Delete old roles if they exist
    const oldRoles = await Role.deleteMany({
      name: { $in: ["Super Admin", "Old Admin", "Old PowerUser"] },
    });
    console.log(`Deleted ${oldRoles.deletedCount} old roles`);

    // Step 2: Create new roles
    const newRoles = [
      {
        name: "Admin",
        permissions: [],
        isSystem: true,
      },
      {
        name: "PowerUser",
        permissions: [
          "MANAGE_USERS",
          "MANAGE_ROLES",
          "MANAGE_NODES",
          "MANAGE_TASKS",
          "VIEW_DATA",
          "VIEW_ALERTS",
        ],
        isSystem: true,
      },
      {
        name: "Worker",
        permissions: ["ASSIGN_TASKS", "VIEW_DATA", "VIEW_ALERTS"],
        isSystem: false,
      },
    ];

    const createdRoles = [];
    for (const roleData of newRoles) {
      const role = await Role.findOneAndUpdate(
        { name: roleData.name },
        {
          $set: {
            permissions: roleData.permissions,
            isSystem: roleData.isSystem,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      createdRoles.push(role);
      console.log(`Created/Updated role: ${role.name}`);
    }

    // Step 3: Update any users with old role references
    // This is a manual step - check if any users need role updates
    const usersWithoutRole = await User.find({ role: null });
    console.log(`Found ${usersWithoutRole.length} users without roles`);

    // Step 4: Log all current roles
    const allRoles = await Role.find();
    console.log("\nCurrent roles in database:");
    allRoles.forEach((role) => {
      console.log(`  - ${role.name} (permissions: ${role.permissions.join(", ") || "none"})`);
    });

    console.log("\nMigration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
