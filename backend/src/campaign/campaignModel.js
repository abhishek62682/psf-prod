import mongoose from "mongoose";
import { CAMPAIGN_STATUSES } from "./campaignConstants.js";

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      required: true,
    },
    goalAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    raisedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDonors: {
      type: Number,
      default: 0,
      min: 0,
    },
    coverImage: {
      type: String,
      default: "",
    },
    gallery: {
      type: [String],
      default: [],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: CAMPAIGN_STATUSES,
      default: "draft",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    paymentReceivingAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentReceivingAccount",
      required: true,
    },
  },
  { timestamps: true }
);

campaignSchema.index({ status: 1, isDeleted: 1 });
campaignSchema.index({ title: "text", shortDescription: "text" });

export default mongoose.model("Campaign", campaignSchema, "campaigns");
