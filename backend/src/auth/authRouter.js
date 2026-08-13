import express from "express";
import { login, verifyOtp, getMe, logout, forgotPassword, resetPassword } from "./authController.js";
import { loginSchema, verifyOtpSchema, forgotPasswordSchema, resetPasswordSchema } from "./authValidation.js";
import authenticate from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const authRouter = express.Router();

authRouter.post("/login", authLimiter, validate(loginSchema), login);
authRouter.post("/verify-otp", authLimiter, validate(verifyOtpSchema), verifyOtp);
authRouter.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
authRouter.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);
authRouter.get("/me", authenticate, getMe);
authRouter.post("/logout", authenticate, logout);

export default authRouter;
