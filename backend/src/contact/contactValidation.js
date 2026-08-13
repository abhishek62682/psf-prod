import { z } from "zod";
import { objectId } from "../middlewares/validate.js";
import { CONTACT_STATUSES, CONTACT_INTERESTS } from "./contactConstants.js";

export const submitContactSchema = z.object({
  body: z.object({
    fullName: z
      .string({ message: "Full name is required." })
      .trim()
      .min(1, { message: "Full name is required." }),
    email: z
      .string({ message: "Email is required." })
      .trim()
      .toLowerCase()
      .pipe(z.email({ message: "A valid email is required." })),
    phone: z.string().trim().optional(),
    subject: z
      .string({ message: "Subject is required." })
      .trim()
      .min(1, { message: "Subject is required." }),
    message: z
      .string({ message: "Message is required." })
      .trim()
      .min(1, { message: "Message is required." }),
    interest: z.enum(CONTACT_INTERESTS, { message: "Invalid interest." }).optional(),
  }),
});

export const contactIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export const updateContactStatusSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    status: z.enum(CONTACT_STATUSES, { message: "Invalid status." }),
  }),
});
