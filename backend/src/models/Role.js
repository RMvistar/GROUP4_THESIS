import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: false }, // protects system roles from deletion
  },
  { timestamps: true },
);

export default mongoose.model("Role", RoleSchema);
