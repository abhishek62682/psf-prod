import mongoose from "mongoose";
import { CAREER_EMPLOYMENT_TYPES, CAREER_WORK_MODES, CAREER_STATUSES } from "./careerConstants.js";

const careerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    employmentType: {
      type: String,
      enum: CAREER_EMPLOYMENT_TYPES,
      required: true,
    },
    workMode: {
      type: String,
      enum: CAREER_WORK_MODES,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      required: true,
      trim: true,
    },
    qualification: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: CAREER_STATUSES,
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

careerSchema.index({ status: 1, isDeleted: 1 });

export default mongoose.model("Career", careerSchema, "careers");
