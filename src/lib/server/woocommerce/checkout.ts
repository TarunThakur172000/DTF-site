// // lib/server/woocommerce/checkout.ts

// import "server-only";

// export type CheckoutBilling = {
//   first_name: string;
//   last_name: string;
//   address_1: string;
//   address_2?: string;
//   city: string;
//   state: string;
//   postcode: string;
//   country: string;
//   email: string;
//   phone?: string;
// };

// export type CheckoutShipping = Omit<CheckoutBilling, "email" | "phone">;

// export type CheckoutResponse = {
//   success: boolean;
//   message?: string;
//   orderId?: number;
//   /**
//    * URL to send the browser to in order to complete payment
//    * (WooCommerce's hosted pay-for-order page, built server-side by WP
//    * since only WP knows the order_key).
//    */
//   payUrl?: string;
// };

// function getStoreHeaders(authToken?: string, sessionToken?: string): Record<string, string> {
//   const secret = process.env.WP_STORE_SECRET;

//   if (!secret) {
//     throw new Error("WP_STORE_SECRET environment variable is missing.");
//   }

//   const headers: Record<string, string> = {
//     "x-store-secret": secret,
//     "Content-Type": "application/json",
//   };

//   if (authToken) {
//     headers["Authorization"] = `Bearer ${authToken}`;
//   } else if (sessionToken) {
//     headers["x-session-token"] = sessionToken;
//   }

//   return headers;
// }

// /**
//  * Converts the current session's WooCommerce cart (built up via addToCart)
//  * into a real order, and returns a URL to redirect the browser to for payment.
//  *
//  * Requires a custom WP endpoint — see the companion PHP snippet below —
//  * that:
//  *   1. Resolves the cart from the auth/session token (same lookup addToCart uses)
//  *   2. Applies billing/shipping to WC()->customer and WC()->cart
//  *   3. Creates the order via wc_create_order() / WC_Checkout::create_order()
//  *   4. Returns { success, orderId, payUrl } as JSON
//  */
// export async function checkoutCart({
//   billing,
//   shipping,
//   customerNote,
//   authToken,
//   sessionToken,
// }: {
//   billing: CheckoutBilling;
//   shipping?: CheckoutShipping;
//   customerNote?: string;
//   authToken?: string;
//   sessionToken?: string;
// }): Promise<CheckoutResponse> {
//   const headers = getStoreHeaders(authToken, sessionToken);

//   const response = await fetch(`${process.env.WOOCOMMERCE_BASE_URL}/wp-json/mystore/v1/checkout`, {
//     method: "POST",
//     headers,
//     cache: "no-store",
//     body: JSON.stringify({
//       billing,
//       shipping: shipping ?? {
//         first_name: billing.first_name,
//         last_name: billing.last_name,
//         address_1: billing.address_1,
//         address_2: billing.address_2 ?? "",
//         city: billing.city,
//         state: billing.state,
//         postcode: billing.postcode,
//         country: billing.country,
//       },
//       customerNote: customerNote ?? "",
//     }),
//   });

//   const data = (await response.json()) as CheckoutResponse;

//   if (!response.ok || !data.success) {
//     throw new Error(data.message || `Checkout failed (${response.status})`);
//   }

//   return data;
// }




// lib/server/woocommerce/checkout.ts
import "server-only";
import { wooCommerceRequest } from "./client";

export type Address = {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
};

export type BillingAddress = Address & {
  email: string;
  phone?: string;
};

export type CheckoutResult = {
  id: number;
  order_key: string;
  status: string;
  currency: string;
  subtotal: string;
  total: string;
  pay_url?: string;
};

type WpCheckoutResponse = {
  success?: boolean;
  message?: string;
  code?: string; // present on WP_Error responses
  order?: CheckoutResult;
};

export class CheckoutError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * Converts the user's cart (stored in WordPress under their x-user-id)
 * into a pending WooCommerce order and returns the pay URL.
 */
export async function checkoutCart({
  userId,
  billing,
  shipping,
  paymentMethodId,
}: {
  userId: string;
  billing: BillingAddress;
  shipping?: Address;
  paymentMethodId: string;
}): Promise<CheckoutResult> {
  const secret = process.env.WP_STORE_SECRET;
  const baseUrl = process.env.WOOCOMMERCE_BASE_URL;

  if (!secret || !baseUrl) {
    throw new Error("WP_STORE_SECRET or WOOCOMMERCE_BASE_URL is missing.");
  }

  const response = await fetch(`${baseUrl}/wp-json/mystore/v1/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-store-secret": secret,
      "x-user-id": userId,
    },
    body: JSON.stringify({ billing, shipping }),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as WpCheckoutResponse;

  if (!response.ok || !data.success || !data.order) {
    throw new CheckoutError(
      data.message || "Checkout failed.",
      response.status || 500,
      data.code
    );
  }

  await wooCommerceRequest<CheckoutResult>(`/orders/${data.order.id}`, {
    method: "PUT",
    body: JSON.stringify({
      payment_method: paymentMethodId,
      ...(paymentMethodId === "cod" ? { status: "on-hold" } : {}),
    }),
  });

  return data.order;
}