import mongoose from "mongoose";

export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    otpSecret: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ADMIN_ROLES,
      default: "SUPER_ADMIN",
    },
    avatar: {
      type: String,
      default: "",
    },
    resetPasswordTokenHash: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema, "admins");
