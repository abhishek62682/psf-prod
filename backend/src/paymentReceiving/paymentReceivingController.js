import createHttpError from "http-errors";
import paymentReceivingModel from "./paymentReceivingModel.js";

export const getDefaultPaymentReceivingAccount = async () => {
  const explicitDefault = await paymentReceivingModel.findOne({
    isDefault: true,
    isDeleted: false,
  });
  if (explicitDefault) return explicitDefault;

  return paymentReceivingModel
    .findOne({ isDeleted: false })
    .sort({ createdAt: 1 });
};

// GET /api/payment-receiving (public) — the current default account.
// The account itself is only ever created/changed via
// scripts/seedPaymentReceiving.js, never through this API — see that
// script for why (payment details must not be editable at runtime).
const getDefaultAccount = async (req, res, next) => {
  try {
    const account = await getDefaultPaymentReceivingAccount();

    if (!account) {
      return next(createHttpError(404, "No payment receiving account is configured."));
    }

    return res.json({
      success: true,
      message: "Payment receiving account fetched successfully.",
      data: account,
    });
  } catch (err) {
    return next(createHttpError(500, "Error while fetching payment receiving account."));
  }
};

export { getDefaultAccount };
