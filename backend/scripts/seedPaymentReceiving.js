/**
 * Creates or updates the default payment receiving account (QR/UPI/bank
 * details donors pay into). Every campaign auto-attaches this account
 * unless a different one is explicitly assigned.
 *
 * This is the ONLY way to set or change these details — there is no admin
 * UI or write API for it, by design, so bank/UPI details can't be tampered
 * with through the app.
 *
 * Usage:
 *   npm run seed:payment
 *
 * Reads PAYMENT_ACCOUNT_NAME, PAYMENT_UPI_ID, PAYMENT_BANK_NAME,
 * PAYMENT_ACCOUNT_NUMBER, PAYMENT_IFSC_CODE, PAYMENT_BRANCH, PAYMENT_QR_CODE
 * from .env. At least one of PAYMENT_UPI_ID / PAYMENT_ACCOUNT_NUMBER is
 * required — a payment account with no way to actually receive payment
 * isn't useful.
 *
 * PAYMENT_QR_CODE should be a static path under /uploads, e.g.
 * "/uploads/qrcode/qrcode.png" — drop the actual image file directly into
 * backend/public/uploads/qrcode/ yourself; there is no upload endpoint for it.
 *
 * Re-running this script UPDATES the existing default account in place
 * (rather than refusing to touch it), so it doubles as the edit tool for
 * these details going forward.
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

  const fields = {
    accountName: process.env.PAYMENT_ACCOUNT_NAME || "NGO Default Account",
    upiId,
    bankName: process.env.PAYMENT_BANK_NAME || undefined,
    accountNumber,
    ifscCode: process.env.PAYMENT_IFSC_CODE || undefined,
    branch: process.env.PAYMENT_BRANCH || undefined,
    qrCode: process.env.PAYMENT_QR_CODE || undefined,
  };

  let account;
  if (existingDefault) {
    existingDefault.set(fields);
    account = await existingDefault.save();
    console.log("Default payment receiving account updated:");
  } else {
    account = await paymentReceivingModel.create({
      ...fields,
      isDefault: true,
      createdBy: admin._id,
    });
    console.log("Default payment receiving account created:");
  }

  console.log(`  id          : ${account._id}`);
  console.log(`  accountName : ${account.accountName}`);

  await mongoose.disconnect();
  process.exit(0);
};

seedPaymentReceiving().catch((err) => {
  console.error("Failed to seed payment receiving account.", err);
  process.exit(1);
});
