import { z } from "zod";
import { emailSchema } from "./common";

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .default("");

export const addressSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(50, "First name is too long."),

  last_name: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(50, "Last name is too long."),

  company: optionalString(100),

  address_1: z
    .string()
    .trim()
    .min(1, "Address is required.")
    .max(200, "Address is too long."),

  address_2: optionalString(200),

  city: z
    .string()
    .trim()
    .min(1, "City is required.")
    .max(100, "City is too long."),

  state: z
    .string()
    .trim()
    .min(1, "State is required.")
    .max(100, "State is too long."),

  postcode: z
    .string()
    .trim()
    .min(3, "Invalid postcode.")
    .max(20, "Invalid postcode."),

  country: z
    .string()
    .trim()
    .length(2, "Country must be a 2-letter country code.")
    .toUpperCase(),

  email: emailSchema.optional(),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long.")
    .optional()
    .default(""),
});

export const updateAddressSchema = z
  .object({
    billing: addressSchema.optional(),
    shipping: addressSchema.optional(),
  })
  .refine(
    (data) => data.billing !== undefined || data.shipping !== undefined,
    {
      message: "At least one address is required.",
    }
  );

export type Address = z.infer<typeof addressSchema>;