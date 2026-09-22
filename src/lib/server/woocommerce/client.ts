import "server-only";

const baseUrl = process.env.WOOCOMMERCE_BASE_URL;
const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
const storeSecret = process.env.WP_STORE_SECRET;
if (!baseUrl) {
  throw new Error("WOOCOMMERCE_BASE_URL is missing");
}

if (!baseUrl) {
  throw new Error("NEXT_PUBLIC_WORDPRESS_URL is missing");
}

if (!storeSecret) {
  throw new Error("WP_STORE_SECRET is missing");
}

if (!consumerKey) {
  throw new Error("WOOCOMMERCE_CONSUMER_KEY is missing");
}

if (!consumerSecret) {
  throw new Error("WOOCOMMERCE_CONSUMER_SECRET is missing");
}

export async function wooCommerceRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${baseUrl}/wp-json/wc/v3${endpoint}`;

  const credentials = Buffer.from(
    `${consumerKey}:${consumerSecret}`
  ).toString("base64");

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Basic ${credentials}`);

  console.log("WooCommerce Request:", {
    url,
    options: {
      ...options,
      headers,
    },
  });

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error(
      `WooCommerce REST API error ${response.status}:`,
      responseText
    );

    throw new Error(
      `WooCommerce REST API error ${response.status}: ${responseText}`
    );
  }

  return responseText
    ? (JSON.parse(responseText) as T)
    : (null as T);
}


export async function wooCommerceFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  authToken?: string,
  sessionToken?: string
): Promise<{
  success: boolean;
  items?: T;
  message?: string;
  [key: string]: any;
}> {
  const url = `${baseUrl}/wp-json/mystore/v1${endpoint}`;

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");
  headers.set("x-store-secret", storeSecret!);

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  } else if (sessionToken) {
    headers.set("x-session-token", sessionToken);
  }

  // If the body is NOT FormData (i.e. it's JSON or empty), ensure Content-Type is set
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  console.log("Custom Store Request:", {
    url,
    method: options.method || "GET",
  });

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  const responseText = await response.text();
  let data: any;

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(`Custom Store API returned invalid JSON (${response.status})`);
  }

  if (!response.ok) {
    console.error(`Custom Store API error ${response.status}:`, data);
    throw new Error(`Custom Store API error ${response.status}: ${data.message || responseText}`);
  }

  return data;
}