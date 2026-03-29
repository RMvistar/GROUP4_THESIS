/**
 * seedRoles.js
 * Run once after migration to create the base roles in MongoDB.
 * Usage:  node src/utils/seedRoles.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../Config/db.js";
import Role from "../models/Role.js";

dotenv.config();

const DEFAULT_ROLES = [
  {
    name: "Admin",
    permissions: [], // bypasses all checks — no permission list needed
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

async function seed() {
  await connectDB();

  const deletedRole = await Role.findOneAndDelete({ name: "Public User" });
  if (deletedRole) {
    console.log('Removed deprecated role: Public User');
  }

  for (const roleData of DEFAULT_ROLES) {
    const result = await Role.findOneAndUpdate(
      { name: roleData.name },
      {
        $set: {
          permissions: roleData.permissions,
          isSystem: roleData.isSystem,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(
      `Upserted role: ${result.name} (permissions: ${result.permissions.join(", ") || "none"})`,
    );
  }

  await mongoose.disconnect();
  console.log("Seeding complete.");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
