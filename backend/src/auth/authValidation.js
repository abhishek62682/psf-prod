import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required." })
      .trim()
      .toLowerCase()
      .pipe(z.email({ message: "A valid email is required." })),
    password: z
      .string({ message: "Password is required." })
      .min(1, { message: "Password is required." }),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required." })
      .trim()
      .toLowerCase()
      .pipe(z.email({ message: "A valid email is required." })),
    otp: z
      .string({ message: "OTP is required." })
      .regex(/^\d{6}$/, { message: "OTP must be 6 digits." }),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required." })
      .trim()
      .toLowerCase()
      .pipe(z.email({ message: "A valid email is required." })),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z
      .string({ message: "Reset token is required." })
      .trim()
      .min(1, { message: "Reset token is required." }),
    password: z
      .string({ message: "Password is required." })
      .min(8, { message: "Password must be at least 8 characters." }),
  }),
});
