import mongoose from "mongoose";
import { DONATION_STATUSES } from "./donationConstants.js";

const auditEntrySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    remarks: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const donationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    name: {
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
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    paymentScreenshot: {
      type: String,
      required: true,
    },
    is80GApplicable: {
      type: Boolean,
      default: false,
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: DONATION_STATUSES,
      default: "pending",
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    verifiedAt: {
      type: Date,
    },
    remarks: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
    auditLog: {
      type: [auditEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

donationSchema.index({ campaignId: 1, status: 1, verifiedAt: -1 });
donationSchema.index({ transactionId: 1 });

export default mongoose.model("Donation", donationSchema, "donations");
