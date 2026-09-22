import "server-only";

import { wooCommerceRequest } from "./client";

export interface WooPaymentMethod {
  id: string;
  title: string;
  description: string;
  order: number;
  enabled: boolean;
  method_title?: string;
  method_description?: string;
  method_supports?: string[];
}

export async function getPaymentMethods(): Promise<WooPaymentMethod[]> {
  const methods = await wooCommerceRequest<WooPaymentMethod[]>(
    "/payment_gateways"
  );

  return methods
    .filter((method) => method.enabled)
    .sort((a, b) => a.order - b.order);
}