import { z } from "zod";

export const orderIdSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "Invalid order ID.")
  .transform(Number)
  .refine((value) => Number.isInteger(value) && value > 0, {
    message: "Invalid order ID.",
  });