import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    first_name: String,
    last_name: String,
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["admin", "guest"],
      default: "guest",
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
  },
);

export default mongoose.model("User", UserSchema);
