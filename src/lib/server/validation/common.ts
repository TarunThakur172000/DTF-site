import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Please provide a valid email address.")
  .max(254, "Email address is too long.");

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "OTP must be a 6-digit number.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.");

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID.");

export const positiveIntegerSchema = z
  .number()
  .int()
  .positive();