// Usage: npm run seed:admin
// Edit ADMINS below and re-run — matched by email, existing accounts are
// updated in place. Don't commit real passwords in this file.
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import { config } from "../src/config/config.js";
import adminModel from "../src/auth/adminModel.js";

// Add one entry per admin you want seeded. `role` must be "SUPER_ADMIN" or
// "ADMIN" (see src/auth/adminModel.js).
const ADMINS = [
  { name: "abhilash", email: "abhilashmahanta824@gmail.com", password: "Abhilash@123", role: "SUPER_ADMIN" },
  { name: "bharat", email: "bharatdehingia1998@gmail.com", password: "Bharat@123", role: "ADMIN" },
   { name: "abhishek", email: "abhishekreact.dev@gmail.com", password: "Abhishek@123", role: "ADMIN" },
];

const seedAdmin = async () => {
  if (!Array.isArray(ADMINS) || ADMINS.length === 0) {
    console.error("ADMINS array in this script is empty — add at least one admin and re-run.");
    process.exit(1);
  }

  for (const { email, password } of ADMINS) {
    if (!email || !password) {
      console.error("Every admin entry needs an email and password.");
      process.exit(1);
    }
  }

  await mongoose.connect(config.databaseUrl);

  for (const { name, email, password, role } of ADMINS) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const secret = speakeasy.generateSecret({
      name: `NGO-Donations (${email})`,
    });

    const admin = await adminModel.findOneAndUpdate(
      { email },
      {
        $set: {
          name: name || "Admin",
          email,
          password: hashedPassword,
          otpSecret: secret.base32,
          role: role || "SUPER_ADMIN",
        },
      },
      { new: true, upsert: true }
    );

    console.log("Administrator seeded successfully:");
    console.log(`  Name       : ${admin.name}`);
    console.log(`  Email      : ${admin.email}`);
    console.log(`  Role       : ${admin.role}`);
    console.log(`  OTP secret : ${secret.base32}`);
    console.log(`  otpauth URL: ${secret.otpauth_url}`);
    console.log("");
  }

  console.log(
    "In development, the OTP is also returned by POST /api/auth/login for easy testing."
  );

  await mongoose.disconnect();
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error("Failed to seed administrators.", err);
  process.exit(1);
});
