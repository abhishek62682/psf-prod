import mongoose from "mongoose";

const paymentReceivingAccountSchema = new mongoose.Schema(
  {
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    qrCode: {
      type: String,
      trim: true,
    },
    upiId: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    ifscCode: {
      type: String,
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    // Only one account can be the default at a time — the campaign creation
    // flow auto-assigns whichever account has this flag set (see
    // getDefaultPaymentReceivingAccount in paymentReceivingController.js).
    isDefault: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "PaymentReceivingAccount",
  paymentReceivingAccountSchema,
  "paymentReceivingAccounts"
);
