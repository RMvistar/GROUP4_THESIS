import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    first_name: String,
    last_name: String,
    name: String,
    email: { type: String, unique: true },
    government_id: String,
    password: String,
    role: {
      type: String,
      enum: ["super-admin", "admin", "worker", "public-user"],
      default: "public-user",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", UserSchema);
