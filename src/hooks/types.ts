import { z } from 'zod';
import { quoteFormSchema } from './validation';

export type QuoteFormData = z.infer<typeof quoteFormSchema>;

export interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}