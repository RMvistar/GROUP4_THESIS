import mongoose from "mongoose";
import dotenv from "dotenv";
import Node from "../models/Node.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Role from "../models/Role.js";

dotenv.config();

const seedTasks = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find or create sample nodes
    let nodeA = await Node.findOne({ node_id: "NODE-A" });
    if (!nodeA) {
      nodeA = await Node.create({
        node_id: "NODE-A",
        location: "Building A - Floor 2",
        status: "active",
        sensor_id: "SENSOR-A-001",
        coordinates: {
          latitude: 14.5995,
          longitude: 120.9842,
        },
        description: "Main drainage sensor in Building A",
      });
      console.log("Created Node A");
    }

    let nodeB = await Node.findOne({ node_id: "NODE-B" });
    if (!nodeB) {
      nodeB = await Node.create({
        node_id: "NODE-B",
        location: "Building B - Floor 1",
        status: "active",
        sensor_id: "SENSOR-B-001",
        coordinates: {
          latitude: 14.6001,
          longitude: 120.985,
        },
        description: "Secondary drainage sensor in Building B",
      });
      console.log("Created Node B");
    }

    let nodeC = await Node.findOne({ node_id: "NODE-C" });
    if (!nodeC) {
      nodeC = await Node.create({
        node_id: "NODE-C",
        location: "Building C - Floor 3",
        status: "active",
        sensor_id: "SENSOR-C-001",
        coordinates: {
          latitude: 14.601,
          longitude: 120.986,
        },
        description: "Tertiary drainage sensor in Building C",
      });
      console.log("Created Node C");
    }

    // Find the first admin user to use as created_by
    const adminUser = await User.findOne().populate("role");
    if (!adminUser) {
      console.log("No users found. Please create a user first.");
      process.exit(1);
    }

    console.log(`Using user: ${adminUser.first_name} ${adminUser.last_name}`);

    // Delete existing tasks to avoid duplicates
    await Task.deleteMany({});
    console.log("Cleared existing tasks");

    // Create sample tasks (alerts)
    const sampleTasks = [
      // PENDING TASKS (Unresolved)
      {
        task_id: "TASK-001",
        title: "High Water Level Detected",
        description:
          "Water level sensor detected unusually high levels in the drainage system. Immediate inspection required.",
        created_by: adminUser._id,
        node_id: nodeA._id,
        status: "pending",
        priority: "high",
      },
      {
        task_id: "TASK-002",
        title: "Clog Detected in Drainage System",
        description:
          "Flow rate has decreased significantly. Possible blockage detected in main pipe.",
        created_by: adminUser._id,
        node_id: nodeA._id,
        status: "pending",
        priority: "high",
      },
      {
        task_id: "TASK-003",
        title: "Sensor Calibration Needed",
        description:
          "Sensor readings showing inconsistent values. Calibration or maintenance required.",
        created_by: adminUser._id,
        node_id: nodeB._id,
        status: "pending",
        priority: "medium",
      },
      {
        task_id: "TASK-004",
        title: "Unusual Flow Pattern",
        description:
          "Flow pattern deviates from normal range. Investigation needed to identify cause.",
        created_by: adminUser._id,
        node_id: nodeB._id,
        status: "pending",
        priority: "medium",
      },
      {
        task_id: "TASK-005",
        title: "Debris Accumulation Warning",
        description:
          "Debris accumulation detected near sensor. Cleaning required to prevent clogging.",
        created_by: adminUser._id,
        node_id: nodeC._id,
        status: "pending",
        priority: "low",
      },

      // ONGOING TASKS
      {
        task_id: "TASK-006",
        title: "Pipe Inspection in Progress",
        description:
          "Maintenance crew currently inspecting pipes for potential leaks or damage.",
        created_by: adminUser._id,
        node_id: nodeA._id,
        status: "ongoing",
        priority: "medium",
      },
      {
        task_id: "TASK-007",
        title: "Filter Replacement Ongoing",
        description:
          "Replacement of drainage filters in progress. Expected completion today.",
        created_by: adminUser._id,
        node_id: nodeB._id,
        status: "ongoing",
        priority: "medium",
      },
      {
        task_id: "TASK-008",
        title: "System Pressure Check",
        description:
          "Checking system pressure levels and adjusting as needed for optimal performance.",
        created_by: adminUser._id,
        node_id: nodeC._id,
        status: "ongoing",
        priority: "low",
      },

      // RESOLVED TASKS
      {
        task_id: "TASK-009",
        title: "Minor Leak Repaired",
        description:
          "Small leak in connecting pipe has been successfully repaired.",
        created_by: adminUser._id,
        node_id: nodeA._id,
        status: "resolved",
        priority: "medium",
        completed_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        task_id: "TASK-010",
        title: "Sensor Maintenance Completed",
        description:
          "Regular maintenance and cleaning of sensors completed successfully.",
        created_by: adminUser._id,
        node_id: nodeA._id,
        status: "resolved",
        priority: "low",
        completed_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        task_id: "TASK-011",
        title: "Blockage Cleared",
        description:
          "Blockage in main drainage line has been cleared. Flow restored to normal.",
        created_by: adminUser._id,
        node_id: nodeB._id,
        status: "resolved",
        priority: "high",
        completed_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        task_id: "TASK-012",
        title: "Valve Adjustment Complete",
        description: "Flow control valves adjusted to optimal settings.",
        created_by: adminUser._id,
        node_id: nodeB._id,
        status: "resolved",
        priority: "medium",
        completed_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        task_id: "TASK-013",
        title: "System Flush Completed",
        description:
          "Complete system flush and cleaning procedure finished successfully.",
        created_by: adminUser._id,
        node_id: nodeC._id,
        status: "resolved",
        priority: "low",
        completed_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    ];

    // Insert all tasks
    const createdTasks = await Task.insertMany(sampleTasks);
    console.log(
      `\n✅ Successfully created ${createdTasks.length} sample tasks!`,
    );

    // Display summary
    const pendingCount = createdTasks.filter(
      (t) => t.status === "pending",
    ).length;
    const ongoingCount = createdTasks.filter(
      (t) => t.status === "ongoing",
    ).length;
    const resolvedCount = createdTasks.filter(
      (t) => t.status === "resolved",
    ).length;

    console.log("\n📊 Summary:");
    console.log(`   - Pending (Unresolved): ${pendingCount}`);
    console.log(`   - Ongoing: ${ongoingCount}`);
    console.log(`   - Resolved: ${resolvedCount}`);
    console.log(`   - Total: ${createdTasks.length}`);
    console.log("\n🎉 Sample data seeded successfully!");
    console.log(
      "You can now test the acknowledge and resolve functionality.\n",
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding tasks:", error);
    process.exit(1);
  }
};

seedTasks();
