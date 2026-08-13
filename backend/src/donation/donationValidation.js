import { z } from "zod";
import { objectId } from "../middlewares/validate.js";

// Indian PAN format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// multipart/form-data sends everything as strings, so coerce numbers/dates/booleans
export const submitDonationSchema = z.object({
  body: z
    .object({
      campaignId: objectId,
      name: z.string({ message: "Name is required." }).trim().min(1, { message: "Name is required." }),
      email: z
        .string({ message: "Email is required." })
        .trim()
        .toLowerCase()
        .pipe(z.email({ message: "A valid email is required." })),
      phone: z
        .string({ message: "Phone is required." })
        .trim()
        .regex(/^[0-9+\-\s]{7,15}$/, { message: "A valid phone number is required." }),
      amount: z.coerce
        .number({ message: "Amount must be a number." })
        .positive({ message: "Amount must be a positive number." }),
      transactionId: z
        .string({ message: "Transaction ID is required." })
        .trim()
        .min(1, { message: "Transaction ID is required." }),
      paymentDate: z.coerce.date({ message: "Payment date must be a valid date." }),
      message: z
        .string()
        .trim()
        .max(500, { message: "Message must be at most 500 characters." })
        .optional(),
      // Older clients that don't send this field are treated as false (see .default below).
      is80GApplicable: z.coerce.boolean().default(false),
      panNumber: z
        .string()
        .trim()
        .toUpperCase()
        .optional(),
    })
    .refine(
      (data) => {
        if (!data.is80GApplicable) return true;
        return !!data.panNumber && PAN_REGEX.test(data.panNumber);
      },
      {
        message: "A valid PAN number is required to claim 80G tax exemption.",
        path: ["panNumber"],
      }
    )
    // Never persist a stray PAN when 80G wasn't requested.
    .transform((data) => ({
      ...data,
      panNumber: data.is80GApplicable ? data.panNumber : undefined,
    })),
});

export const donationIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export const verifyDonationSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    remarks: z
      .string()
      .trim()
      .max(500, { message: "Remarks must be at most 500 characters." })
      .optional(),
  }),
});

export const rejectDonationSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    reason: z
      .string({ message: "Rejection reason is required." })
      .trim()
      .min(1, { message: "Rejection reason is required." }),
  }),
});
