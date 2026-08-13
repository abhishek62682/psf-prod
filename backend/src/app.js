import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import createHttpError from "http-errors";
import multer from "multer";
import { config } from "./config/config.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";

import authRouter from "./auth/authRouter.js";
import profileRouter from "./profile/profileRouter.js";
import dashboardRouter from "./dashboard/dashboardRouter.js";
import campaignRouter from "./campaign/campaignRouter.js";
import donationRouter from "./donation/donationRouter.js";
import uploadRouter from "./upload/uploadRouter.js";
import paymentReceivingRouter from "./paymentReceiving/paymentReceivingRouter.js";
import contactRouter from "./contact/contactRouter.js";
import careerRouter from "./career/careerRouter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Trust the first proxy hop (nginx) so express-rate-limit reads the real
// client IP from X-Forwarded-For instead of throwing ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
app.set("trust proxy", 1);

// ----- Security & core middleware -----
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow serving uploaded images to the frontend
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header (curl, server-to-server, same-origin) — allow.
      if (!origin || config.frontendDomains.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

// ----- Static files (uploaded images) -----
app.use("/uploads", express.static(path.resolve(__dirname, "../public/uploads")));

// ----- Rate limiting for all API routes -----
app.use("/api", apiLimiter);

// ----- Health check -----
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is up and running." });
});

// ----- Routers -----
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/campaigns", campaignRouter);
app.use("/api/donations", donationRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/payment-receiving", paymentReceivingRouter);
app.use("/api/contact", contactRouter);
app.use("/api/careers", careerRouter);

// ----- 404 handler -----
app.use((req, res, next) => {
  next(createHttpError(404, "Route not found."));
});

// ----- Multer error normalizer -----
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    let message = err.message;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Image must be smaller than 5 MB.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Too many files or wrong field name. Max 10 images per request.";
    }
    return next(createHttpError(400, message));
  }
  next(err);
});

// ----- Global error handler -----
app.use(globalErrorHandler);

export default app;
