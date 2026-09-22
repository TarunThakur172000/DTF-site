import "server-only";

import { wooCommerceRequest } from "./client";

export interface WooOrder {
  id: number;
  customer_id: number;
  status: string;
  currency: string;
  total: string;
  subtotal: string;
  total_tax: string;
  date_created: string;
  date_modified: string;

  payment_method: string;
  payment_method_title: string;

  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };

  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };

  line_items: WooOrderLineItem[];
}

export interface WooOrderLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  sku: string;
  price: number;
  image?: {
    id: string;
    src: string;
    name: string;
    alt: string;
  };
}

export async function getCustomerOrders(
  customerId: number
): Promise<WooOrder[]> {
  return wooCommerceRequest<WooOrder[]>(
    `/orders?customer=${customerId}&orderby=date&order=desc`
  );
}

export async function getCustomerOrder(
  customerId: number,
  orderId: number
): Promise<WooOrder | null> {
  try {
    const order = await wooCommerceRequest<WooOrder>(
      `/orders/${orderId}`
    );

    // Extra security check.
    // Never return an order belonging to another customer.
    if (order.customer_id !== customerId) {
      return null;
    }

    return order;
  } catch (error) {
    console.error("GET_CUSTOMER_ORDER_ERROR:", error);
    return null;
  }
}