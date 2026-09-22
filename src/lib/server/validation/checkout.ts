import { z } from "zod";
import { addressSchema } from "./address";

export const checkoutSchema = z.object({
  billing: addressSchema,

  shipping: addressSchema,

  payment_method: z
    .string()
    .trim()
    .min(1, "Payment method is required.")
    .max(100, "Invalid payment method."),

  customer_note: z
    .string()
    .trim()
    .max(500, "Customer note is too long.")
    .optional()
    .default(""),
});