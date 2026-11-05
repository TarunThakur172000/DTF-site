import {
  getCart,
  getCartOwner,
} from "@/lib/server/cart";
import { getCurrentUser } from "@/lib/server/auth/session";
import {
  getAvailableCheckoutCoupons,
  validateCheckoutCoupon,
} from "@/lib/server/woocommerce/coupons";
import {
  readRequestBody,
  RequestBodyTooLargeError,
} from "@/lib/server/request-body";

export const dynamic = "force-dynamic";

const MAX_COUPON_BODY_BYTES = 2048;

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function couponCartData(
  items: NonNullable<Awaited<ReturnType<typeof getCart>>>["items"]
) {
  const productIds = items.map((item) => item.productId);
  if (
    !productIds.every(
      (id): id is number =>
        typeof id === "number" && Number.isSafeInteger(id) && id > 0
    )
  ) {
    throw new Error("INVALID_CART_PRODUCT");
  }
  return {
    productIds,
    quantities: items.map((item) => item.quantity),
  };
}

export async function GET() {
  try {
    const owner = await getCartOwner(false);
    if (!owner) {
      return Response.json({ success: true, coupons: [] }, {
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    const cart = await getCart(owner);
    if (
      !cart?.items.length ||
      cart.items.some(
        (item) =>
          typeof item.productId !== "number" ||
          !Number.isSafeInteger(item.productId) ||
          item.productId <= 0
      )
    ) {
      return Response.json({ success: true, coupons: [] }, {
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    const { productIds, quantities } = couponCartData(cart.items);
    const user = await getCurrentUser();
    const coupons = await getAvailableCheckoutCoupons(
      productIds,
      quantities,
      user?.email ?? ""
    );
    return Response.json(
      { success: true, coupons },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("GET_CHECKOUT_COUPONS_ERROR:", error);
    return Response.json(
      { success: false, message: "Available coupons could not be loaded." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json(
      { success: false, message: "Invalid coupon request." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const rawBody = await readRequestBody(request, MAX_COUPON_BODY_BYTES);
    const body: unknown = JSON.parse(rawBody);
    if (
      typeof body !== "object" ||
      body === null ||
      !("code" in body) ||
      typeof body.code !== "string" ||
      !/^[^\u0000-\u001f\u007f]{1,100}$/u.test(body.code.trim()) ||
      !("email" in body) ||
      typeof body.email !== "string" ||
      body.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
    ) {
      return Response.json(
        { success: false, message: "Enter a valid coupon code and email." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const owner = await getCartOwner(false);
    const cart = owner ? await getCart(owner) : null;
    if (
      !cart?.items.length ||
      cart.items.some(
        (item) =>
          typeof item.productId !== "number" ||
          !Number.isSafeInteger(item.productId) ||
          item.productId <= 0
      )
    ) {
      return Response.json(
        { success: false, message: "Your cart is not eligible for coupons." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { productIds, quantities } = couponCartData(cart.items);
    const coupon = await validateCheckoutCoupon(
      body.code.trim(),
      productIds,
      quantities,
      body.email.trim().toLowerCase()
    );
    if (!coupon) {
      return Response.json(
        { success: false, message: "This coupon is not valid for your cart." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    return Response.json(
      { success: true, coupon },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return Response.json(
        { success: false, message: "Coupon request is too large." },
        { status: 413, headers: { "Cache-Control": "no-store" } }
      );
    }
    console.error("VALIDATE_CHECKOUT_COUPON_ERROR:", error);
    return Response.json(
      { success: false, message: "Coupon validation is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
