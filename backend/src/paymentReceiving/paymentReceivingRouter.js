import express from "express";
import {
  getDefaultAccount,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  removeQrCode,
  adminListAuditLogs,
} from "./paymentReceivingController.js";
import {
  createPaymentReceivingSchema,
  updatePaymentReceivingSchema,
  paymentReceivingIdSchema,
} from "./paymentReceivingValidation.js";
import authenticate from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";

const paymentReceivingRouter = express.Router();

// ----- Public -----
paymentReceivingRouter.get("/", getDefaultAccount);

// ----- Admin -----
// Must come before "/:id" or it'd match as an :id.
paymentReceivingRouter.get("/audit-logs", authenticate, adminListAuditLogs);
paymentReceivingRouter.get(
  "/:id",
  authenticate,
  validate(paymentReceivingIdSchema),
  getAccount
);
paymentReceivingRouter.post(
  "/",
  authenticate,
  validate(createPaymentReceivingSchema),
  createAccount
);
paymentReceivingRouter.patch(
  "/:id",
  authenticate,
  validate(updatePaymentReceivingSchema),
  updateAccount
);
paymentReceivingRouter.delete(
  "/:id/qr-code",
  authenticate,
  validate(paymentReceivingIdSchema),
  removeQrCode
);
paymentReceivingRouter.delete(
  "/:id",
  authenticate,
  validate(paymentReceivingIdSchema),
  deleteAccount
);

export default paymentReceivingRouter;
