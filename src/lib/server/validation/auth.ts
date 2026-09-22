import { z } from "zod";
import {
  emailSchema,
  otpSchema,
  passwordSchema,
} from "./common";

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required.")
    .max(100, "Full name is too long."),

  businessName: z
    .string()
    .trim()
    .max(150, "Business name is too long.")
    .optional()
    .default(""),

  email: emailSchema,

  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,

  password: z
    .string()
    .min(1, "Password is required.")
    .max(128, "Password is too long."),
});

export const verifyEmailSchema = z.object({
  email: emailSchema,

  otp: otpSchema,
});

export const resendOtpSchema = z.object({
  email: emailSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,

  otp: otpSchema,

  newPassword: passwordSchema,
});