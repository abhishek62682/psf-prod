import mongoose from "mongoose";

const changeSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
    newValue: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const paymentReceivingAuditLogSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentReceivingAccount",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["created", "updated", "deleted", "qr_code_removed"],
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    changes: {
      type: [changeSchema],
      default: [],
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

paymentReceivingAuditLogSchema.index({ createdAt: -1 });

export default mongoose.model(
  "PaymentReceivingAuditLog",
  paymentReceivingAuditLogSchema,
  "paymentReceivingAuditLogs"
);
