import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Name must be at least 2 characters." })
      .optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ message: "A valid email is required." }))
      .optional(),
    avatar: z.string().optional(),
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string({ message: "Current password is required." })
      .min(1, { message: "Current password is required." }),
    newPassword: z
      .string({ message: "New password is required." })
      .min(8, { message: "New password must be at least 8 characters." }),
  }),
});
