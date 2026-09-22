// lib/server/woocommerce/cart.ts

export type CartItem = {
  key: string;
  id: number;
  quantity: number;
  width: string;
  height: string;
  jobName: string;
  additionalService?: string;
  orderNotes?: string;
  fileUrl?: string;
};

export type CartResponse = {
  success: boolean;
  items: CartItem[];
  message?: string;
  sessionToken?: string; // Optional: if WordPress returns a session token back
};
// Helper to get secured headers matching your WordPress PHP backend expectations
function getStoreHeaders(authToken?: string, sessionToken?: string): Record<string, string> {
  const secret = process.env.WP_STORE_SECRET;
  
  if (!secret) {
    throw new Error("WP_STORE_SECRET environment variable is missing.");
  }

  const headers: Record<string, string> = {
    "x-store-secret": secret,
  };

  if (authToken) {
    // WordPress checks $request->get_header( 'authorization' ) for Bearer tokens
    headers["Authorization"] = `Bearer ${authToken}`;
  } else if (sessionToken) {
    // WordPress checks $request->get_header( 'x-session-token' ) for guest sessions
    headers["x-session-token"] = sessionToken;
  }

  return headers;
}

/**
 * Get the current user's isolated cart from WordPress.
 */
export async function getCart(authToken?: string, sessionToken?: string) {
  const headers = getStoreHeaders(authToken, sessionToken);
  
  const response = await fetch(`${process.env.WOOCOMMERCE_BASE_URL}/wp-json/mystore/v1/cart`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return response.json() as Promise<CartResponse>;
}

/**
 * Add a custom item to the user's cart.
 */
export async function addToCart({
  productId,
  quantity = 1,
  width,
  height,
  jobName,
  additionalService,
  orderNotes,
  fileUrl,
  file,
  authToken,
  sessionToken,
}: {
  productId: number;
  quantity?: number;
  width: string;
  height: string;
  jobName: string;
  additionalService?: string;
  orderNotes?: string;
  fileUrl?: string;
  file?: File;
  authToken?: string;
  sessionToken?: string;
}) {
  const headers = getStoreHeaders(authToken, sessionToken);
  let body: FormData | string;

  if (file) {
    const formData = new FormData();
    formData.append("id", String(productId));
    formData.append("quantity", String(quantity));
    formData.append("width", width);
    formData.append("height", height);
    formData.append("jobName", jobName);
    formData.append("additionalService", additionalService || "");
    formData.append("orderNotes", orderNotes || "");
    formData.append("file", file);
    body = formData;
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({
      id: productId,
      quantity,
      width,
      height,
      jobName,
      additionalService: additionalService || "",
      orderNotes: orderNotes || "",
      fileUrl: fileUrl || "",
    });
  }

  const response = await fetch(`${process.env.WOOCOMMERCE_BASE_URL}/wp-json/mystore/v1/add`, {
    method: "POST",
    headers,
    body,
  });

  return response.json() as Promise<CartResponse>;
}

/**
 * Clear the user's entire cart.
 */
export async function clearCart(authToken?: string, sessionToken?: string) {
  const headers = getStoreHeaders(authToken, sessionToken);

  const response = await fetch(`${process.env.WOOCOMMERCE_BASE_URL}/wp-json/mystore/v1/cart`, {
    method: "DELETE",
    headers,
  });

  return response.json() as Promise<CartResponse>;
}

export async function removeCartItem(itemKey: string, authToken?: string, sessionToken?: string) {
  const headers = getStoreHeaders(authToken, sessionToken);

  const response = await fetch(`${process.env.WOOCOMMERCE_BASE_URL}/wp-json/mystore/v1/cart/item?key=${encodeURIComponent(itemKey)}`, {
    method: "DELETE",
    headers,
  });

  return response.json() as Promise<CartResponse>;
}