import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Database not found");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    // Drop old username index if it exists
    try {
      const db = mongoose.connection.db;
      await db.collection("users").dropIndex("username_1");
      console.log("Old username index dropped");
    } catch (err) {
      // Index might not exist, that's okay
      if (err.code !== 27) console.log("No old index to drop");
    }
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    process.exit(1);
  }
};
