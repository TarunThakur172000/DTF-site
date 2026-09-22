import { z } from 'zod';

export const quoteFormSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  companyName: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  productType: z.string().min(1, 'Please select a product type'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than zero'),
  printingSize: z.string().optional(),
  material: z.string().optional(),
  designServices: z.enum(['yes', 'no']),
  deliveryDate: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
  file: z.any().optional(), // In production, validate File instance and size
});