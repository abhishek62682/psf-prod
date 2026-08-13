import crypto from "node:crypto";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import adminModel from "./adminModel.js";
import { config } from "../config/config.js";
import { sendPasswordResetEmail } from "../mail/authEmailService.js";

const OTP_STEP_SECONDS = 30; // matches Google Authenticator's fixed 30s step
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const hashResetToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const generateOtp = (admin) =>
  speakeasy.totp({
    secret: admin.otpSecret,
    encoding: "base32",
    step: OTP_STEP_SECONDS,
  });

const verifyOtpCode = (admin, otp) =>
  speakeasy.totp.verify({
    secret: admin.otpSecret,
    encoding: "base32",
    token: otp,
    step: OTP_STEP_SECONDS,
    window: 1, // allow one step of clock drift
  });

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await adminModel
      .findOne({ email })
      .select("+password +otpSecret");

    if (!admin) {
      return next(createHttpError(401, "Invalid email or password."));
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return next(createHttpError(401, "Invalid email or password."));
    }

    return res.json({
      success: true,
      message: "Credentials verified. Enter the code from your authenticator app.",
      // Convenience for local testing only — never exposed in production.
      ...(config.env === "development" && { otp: generateOtp(admin) }),
    });
  } catch (err) {
    return next(createHttpError(500, "Error while logging in."));
  }
};

// POST /api/auth/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const admin = await adminModel.findOne({ email }).select("+otpSecret");
    if (!admin) {
      return next(createHttpError(401, "Invalid email or OTP."));
    }

    if (!verifyOtpCode(admin, otp)) {
      return next(createHttpError(401, "Invalid or expired OTP."));
    }

    const token = jwt.sign(
      { sub: admin._id, role: admin.role },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    return next(createHttpError(500, "Error while verifying OTP."));
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const admin = await adminModel.findById(req.adminId);

    if (!admin) {
      return next(createHttpError(404, "Administrator not found."));
    }

    return res.json({
      success: true,
      message: "Administrator fetched successfully.",
      data: {
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          avatar: admin.avatar,
        },
      },
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching administrator."));
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  // JWT is stateless — the client simply discards the token.
  return res.json({
    success: true,
    message: "Logged out successfully.",
  });
};

// POST /api/auth/forgot-password
// Always responds with the same generic message regardless of whether the
// email matches an account — an account-enumeration oracle is a bigger risk
// than a slightly confusing UX for the rare mistyped-email case.
const forgotPassword = async (req, res, next) => {
  const genericResponse = {
    success: true,
    message: "If an account exists for that email, a password reset link has been sent.",
  };

  try {
    const { email } = req.body;

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.json(genericResponse);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    admin.resetPasswordTokenHash = hashResetToken(rawToken);
    admin.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await admin.save();

    const resetLink = `${config.adminPanelUrl}/auth/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail(admin, resetLink);
    } catch (emailErr) {
      console.error("Failed to send password reset email:", emailErr);
    }

    return res.json(genericResponse);
  } catch (err) {
    return next(createHttpError(500, "Error while processing password reset request."));
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const admin = await adminModel
      .findOne({
        resetPasswordTokenHash: hashResetToken(token),
        resetPasswordExpires: { $gt: new Date() },
      })
      .select("+resetPasswordTokenHash +resetPasswordExpires");

    if (!admin) {
      return next(createHttpError(400, "This reset link is invalid or has expired. Please request a new one."));
    }

    admin.password = await bcrypt.hash(password, 10);
    admin.resetPasswordTokenHash = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    return res.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (err) {
    return next(createHttpError(500, "Error while resetting password."));
  }
};

export { login, verifyOtp, getMe, logout, forgotPassword, resetPassword };
