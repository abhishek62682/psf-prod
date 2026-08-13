/**
 * Creates the default payment receiving account (QR/UPI/bank details donors
 * pay into). Every campaign auto-attaches this account unless a different
 * one is explicitly assigned.
 *
 * Usage:
 *   npm run seed:payment
 *
 * Reads PAYMENT_ACCOUNT_NAME, PAYMENT_UPI_ID, PAYMENT_BANK_NAME,
 * PAYMENT_ACCOUNT_NUMBER, PAYMENT_IFSC_CODE, PAYMENT_BRANCH, PAYMENT_QR_CODE
 * from .env. At least one of PAYMENT_UPI_ID / PAYMENT_ACCOUNT_NUMBER is
 * required — a payment account with no way to actually receive payment
 * isn't useful.
 */
import mongoose from "mongoose";
import { config } from "../src/config/config.js";
import adminModel from "../src/auth/adminModel.js";
import paymentReceivingModel from "../src/paymentReceiving/paymentReceivingModel.js";

const seedPaymentReceiving = async () => {
  const upiId = process.env.PAYMENT_UPI_ID;
  const accountNumber = process.env.PAYMENT_ACCOUNT_NUMBER;

  if (!upiId && !accountNumber) {
    console.error(
      "Set PAYMENT_UPI_ID or PAYMENT_ACCOUNT_NUMBER (plus related fields) in .env before seeding."
    );
    process.exit(1);
  }

  await mongoose.connect(config.databaseUrl);

  const admin = await adminModel.findOne().sort({ createdAt: 1 });
  if (!admin) {
    console.error("No administrator found. Run `npm run seed:admin` first.");
    await mongoose.disconnect();
    process.exit(1);
  }

  const existingDefault = await paymentReceivingModel.findOne({
    isDefault: true,
    isDeleted: false,
  });

  if (existingDefault) {
    console.log("A default payment receiving account already exists:");
    console.log(`  id          : ${existingDefault._id}`);
    console.log(`  accountName : ${existingDefault.accountName}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const account = await paymentReceivingModel.create({
    accountName: process.env.PAYMENT_ACCOUNT_NAME || "NGO Default Account",
    upiId,
    bankName: process.env.PAYMENT_BANK_NAME || undefined,
    accountNumber,
    ifscCode: process.env.PAYMENT_IFSC_CODE || undefined,
    branch: process.env.PAYMENT_BRANCH || undefined,
    qrCode: process.env.PAYMENT_QR_CODE || undefined,
    isDefault: true,
    createdBy: admin._id,
  });

  console.log("Default payment receiving account created:");
  console.log(`  id          : ${account._id}`);
  console.log(`  accountName : ${account.accountName}`);

  await mongoose.disconnect();
  process.exit(0);
};

seedPaymentReceiving().catch((err) => {
  console.error("Failed to seed payment receiving account.", err);
  process.exit(1);
});
