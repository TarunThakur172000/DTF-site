import "server-only";

import { wooCommerceRequest } from "./client";

export interface WooOrder {
  id: number;
  customer_id: number;
  status: string;
  currency: string;
  total: string;
  discount_total: string;
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
  const perPage = 100;
  const orders: WooOrder[] = [];
  let page = 1;

  while (true) {
    const pageOrders = await wooCommerceRequest<WooOrder[]>(
      `/orders?customer=${customerId}&orderby=date&order=desc&per_page=${perPage}&page=${page}`
    );

    orders.push(...pageOrders);

    if (pageOrders.length < perPage) {
      return orders;
    }

    page += 1;
  }
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



export interface CreateOrderInput {
  customer_id?: number;
  status?: "pending" | "processing";
  payment_method?: string;
  payment_method_title?: string;
  set_paid: false;
  billing: WooOrder["billing"];
  shipping: WooOrder["shipping"];
  line_items: {
    product_id: number;
    variation_id?: number;
    quantity: number;
    meta_data?: { key: string; value: string }[];
  }[];
  meta_data: { key: string; value: string }[];
  coupon_lines?: { code: string }[];
  customer_note?: string;
  shipping_lines?: {
    method_id: string;
    method_title: string;
    total: string;
  }[];
}

export interface CreateOrderResponse extends WooOrder {
  order_key: string;
  payment_url?: string;
  needs_payment?: boolean;
  meta_data?: { key: string; value: unknown }[];
  coupon_lines?: { code: string; discount?: string; discount_tax?: string }[];
}

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResponse> {
  return wooCommerceRequest<CreateOrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function cancelOrder(orderId: number) {
  return updateOrderStatus(orderId, "cancelled");
}

export async function updateOrderStatus(
  orderId: number,
  status: "pending" | "processing" | "cancelled"
) {
  return wooCommerceRequest<CreateOrderResponse>(`/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}