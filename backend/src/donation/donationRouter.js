import express from "express";
import {
  submitDonation,
  listDonations,
  getRecentDonations,
  adminListDonations,
  adminGetDonation,
  verifyDonation,
  rejectDonation,
} from "./donationController.js";
import {
  submitDonationSchema,
  donationIdSchema,
  verifyDonationSchema,
  rejectDonationSchema,
} from "./donationValidation.js";
import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";
import validate from "../middlewares/validate.js";
import { donationLimiter } from "../middlewares/rateLimiter.js";

const donationRouter = express.Router();

// Multer runs first so the text fields are parsed into req.body,
// then Zod validates + coerces them.
// Force donor screenshots into /uploads/screenshot (no query param needed)
const setScreenshotType = (req, res, next) => {
  req.uploadType = "screenshot";
  next();
};

// ----- Public -----
donationRouter.post(
  "/",
  donationLimiter,
  setScreenshotType,
  upload.single("paymentScreenshot"),
  validate(submitDonationSchema),
  submitDonation
);

// "/admin" and "/recents" must come before "/:id" — otherwise they'd match
// as an :id and hit the protected adminGetDonation handler instead.
donationRouter.get("/admin", authenticate, adminListDonations);
donationRouter.get("/recents", getRecentDonations);
donationRouter.get("/", listDonations);

// ----- Admin (protected) -----
donationRouter.get("/:id", authenticate, validate(donationIdSchema), adminGetDonation);
donationRouter.patch(
  "/:id/verify",
  authenticate,
  validate(verifyDonationSchema),
  verifyDonation
);
donationRouter.patch(
  "/:id/reject",
  authenticate,
  validate(rejectDonationSchema),
  rejectDonation
);

export default donationRouter;
