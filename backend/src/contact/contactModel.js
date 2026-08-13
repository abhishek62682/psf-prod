import mongoose from "mongoose";
import { CONTACT_STATUSES, CONTACT_INTERESTS } from "./contactConstants.js";

const contactMessageSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    interest: {
      type: String,
      enum: CONTACT_INTERESTS,
    },
    status: {
      type: String,
      enum: CONTACT_STATUSES,
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
);

contactMessageSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("ContactMessage", contactMessageSchema, "contactMessages");
