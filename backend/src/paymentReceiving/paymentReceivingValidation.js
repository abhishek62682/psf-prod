import { z } from "zod";
import { objectId } from "../middlewares/validate.js";

const paymentReceivingBody = z.object({
  accountName: z
    .string({ message: "Account name is required." })
    .trim()
    .min(1, { message: "Account name is required." }),
  qrCode: z.string().trim().optional(),
  upiId: z.string().trim().optional(),
  bankName: z.string().trim().optional(),
  accountNumber: z.string().trim().optional(),
  ifscCode: z.string().trim().optional(),
  branch: z.string().trim().optional(),
  isDefault: z.coerce.boolean().optional(),
});

export const createPaymentReceivingSchema = z.object({
  body: paymentReceivingBody.refine(
    (data) => Boolean(data.qrCode || data.upiId || data.accountNumber),
    {
      message: "Provide at least one payment method: QR code, UPI ID, or bank account number.",
      path: ["qrCode"],
    }
  ),
});

export const updatePaymentReceivingSchema = z.object({
  params: z.object({ id: objectId }),
  body: paymentReceivingBody.partial(),
});

export const paymentReceivingIdSchema = z.object({
  params: z.object({ id: objectId }),
});
