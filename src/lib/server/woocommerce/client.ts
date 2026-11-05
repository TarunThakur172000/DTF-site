import "server-only";

export class WooCommerceApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string
  ) {
    super(`WooCommerce REST API error ${status} (${code})`);
    this.name = "WooCommerceApiError";
  }
}

export async function wooCommerceRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.WOOCOMMERCE_BASE_URL;
  const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

  if (!baseUrl || !consumerKey || !consumerSecret) {
    throw new Error(
      "WooCommerce URL and REST API credentials must be configured"
    );
  }

  let storeUrl: URL;
  try {
    storeUrl = new URL(baseUrl);
  } catch {
    throw new Error("WOOCOMMERCE_BASE_URL must be a valid URL");
  }

  const isLocalDevelopment =
    process.env.NODE_ENV !== "production" &&
    (storeUrl.hostname === "localhost" ||
      storeUrl.hostname === "127.0.0.1" ||
      storeUrl.hostname === "::1");
  if (
    (storeUrl.protocol !== "https:" && !isLocalDevelopment) ||
    storeUrl.username ||
    storeUrl.password ||
    storeUrl.search ||
    storeUrl.hash
  ) {
    throw new Error("WOOCOMMERCE_BASE_URL must use a secure HTTPS origin");
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const url = `${normalizedBaseUrl}/wp-json/wc/v3${endpoint}`;

  const credentials = Buffer.from(
    `${consumerKey}:${consumerSecret}`
  ).toString("base64");

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Basic ${credentials}`);

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
    redirect: "error",
  });

  const responseText = await response.text();

  if (!response.ok) {
    let code = "unknown_error";
    try {
      const errorPayload: unknown = JSON.parse(responseText);
      if (
        typeof errorPayload === "object" &&
        errorPayload !== null &&
        "code" in errorPayload &&
        typeof errorPayload.code === "string" &&
        /^[a-zA-Z0-9_-]{1,120}$/.test(errorPayload.code)
      ) {
        code = errorPayload.code;
      }
    } catch {
      // Do not log or return the upstream body; it may contain customer data.
    }

    console.error("WooCommerce REST API request failed", {
      status: response.status,
      code,
    });
    throw new WooCommerceApiError(response.status, code);
  }

  return responseText
    ? (JSON.parse(responseText) as T)
    : (null as T);
}

export interface WooPaymentGateway {
  id: string;
  title: string;
  description?: string;
  enabled: boolean | "yes" | "no";
}

export async function getPaymentGateways() {
  return wooCommerceRequest<WooPaymentGateway[]>("/payment_gateways");
}

export async function getWooOrder<T>(orderId: number) {
  return wooCommerceRequest<T>(`/orders/${orderId}`);
}

export interface WooCommerceFetchResponse<T> {
  success: boolean;
  items?: T;
  message?: string;
  [key: string]: unknown;
}

export async function wooCommerceFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  authToken?: string,
  sessionToken?: string
): Promise<WooCommerceFetchResponse<T>> {
  const baseUrl = process.env.WOOCOMMERCE_BASE_URL;
  const storeSecret = process.env.WP_STORE_SECRET;

  if (!baseUrl || !storeSecret) {
    throw new Error(
      "WOOCOMMERCE_BASE_URL and WP_STORE_SECRET must be configured"
    );
  }

  const url = `${baseUrl}/wp-json/mystore/v1${endpoint}`;

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");
  headers.set("x-store-secret", storeSecret);

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  } else if (sessionToken) {
    headers.set("x-session-token", sessionToken);
  }

  // If the body is NOT FormData (i.e. it's JSON or empty), ensure Content-Type is set
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  const responseText = await response.text();
  let data: unknown;

  try {
    data = responseText ? (JSON.parse(responseText) as unknown) : {};
  } catch {
    throw new Error(`Custom Store API returned invalid JSON (${response.status})`);
  }

  if (!response.ok) {
    console.error(`Custom Store API error ${response.status}`);
    throw new Error(`Custom Store API error ${response.status}`);
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("Custom Store API returned an invalid response");
  }

  return data as WooCommerceFetchResponse<T>;
}