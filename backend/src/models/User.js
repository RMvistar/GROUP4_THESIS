import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

export default mongoose.model("User", UserSchema);
