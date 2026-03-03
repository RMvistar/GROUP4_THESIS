import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    first_name: String,
    last_name: String,
    username: String,
    email: { type: String, unique: true },
    government_id: String,
    password: String,
    status: { type: String, default: "Active" }, // Active, Suspended, Inactive

    // Role is a reference to the Role collection (RBAC)
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("User", UserSchema);
