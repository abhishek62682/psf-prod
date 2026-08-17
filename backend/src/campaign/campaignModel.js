import mongoose from "mongoose";
import { CAMPAIGN_STATUSES } from "./campaignConstants.js";

const campaignDocumentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    // Admin-provided label shown in place of the raw filename, e.g. "Annual Report 2026".
    label: { type: String, required: true, trim: true },
  },
  { _id: false }
);

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
    // Optional, up to 6 PDFs with admin-written labels, enforced in campaignValidation.js.
    documents: {
      type: [campaignDocumentSchema],
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
