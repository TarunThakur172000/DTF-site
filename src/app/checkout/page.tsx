import { createHmac, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth/session";

export default async function CheckoutPage(): Promise<never> {
  const user = await getCurrentUser();
  const storeUrl = process.env.WOOCOMMERCE_BASE_URL;
  const storeSecret = process.env.WP_STORE_SECRET;

  if (!user) {
    redirect("/login");
  }

  if (!storeUrl || !storeSecret) {
    throw new Error(
      "WOOCOMMERCE_BASE_URL or WP_STORE_SECRET is missing"
    );
  }

  const wooCustomerId = Number(user.woocommerceCustomerId);
  if (!Number.isSafeInteger(wooCustomerId) || wooCustomerId <= 0) {
    throw new Error("Your account is not linked to a WooCommerce customer.");
  }

  const userId = String(user._id);
  const expires = Math.floor(Date.now() / 1000) + 300;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${userId}|${wooCustomerId}|${expires}|${nonce}`;
  const signature = createHmac("sha256", storeSecret)
    .update(payload)
    .digest("hex");
  const handoffUrl = new URL(
    "/wp-json/mystore/v1/checkout/handoff",
    storeUrl
  );

  handoffUrl.searchParams.set("user_id", userId);
  handoffUrl.searchParams.set("customer_id", String(wooCustomerId));
  handoffUrl.searchParams.set("expires", String(expires));
  handoffUrl.searchParams.set("nonce", nonce);
  handoffUrl.searchParams.set("signature", signature);

  redirect(handoffUrl.toString());
}
