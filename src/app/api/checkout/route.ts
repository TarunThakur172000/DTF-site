import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/server/auth/session";
import {
  getCart,
  getCartOwner,
} from "@/lib/server/cart";
import {
  cancelOrder,
  createOrder,
  updateOrderStatus,
  type CreateOrderInput,
  type CreateOrderResponse,
} from "@/lib/server/woocommerce/orders";
import {
  getPaymentGateways,
  getWooOrder,
  WooCommerceApiError,
  type WooPaymentGateway,
} from "@/lib/server/woocommerce/client";
import {
  createWooCustomer,
  findWooCustomerByEmail,
} from "@/lib/server/woocommerce/customers";
import { validateCheckoutCoupon } from "@/lib/server/woocommerce/coupons";
import { uploadWordPressMedia } from "@/lib/server/wordpress/media";
import { connectDB } from "@/lib/server/db";
import Cart from "@/models/Cart";
import {
  readRequestBody,
  RequestBodyTooLargeError,
} from "@/lib/server/request-body";
import CheckoutTransaction from "@/models/CheckoutTransaction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUEST_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_CHECKOUT_BODY_BYTES = 16 * 1024;
const ATTEMPT_RETENTION_MS = 365 * 24 * 60 * 60 * 1000;

interface BillingInput {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

interface CheckoutRequest {
  requestId: string;
  paymentMethod: string;
  couponCode: string;
  billing: BillingInput;
}

interface StoredWooOrder extends CreateOrderResponse {
  meta_data?: { key: string; value: unknown }[];
  needs_payment?: boolean;
}

function json(
  body: unknown,
  status = 200
) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(
  value: unknown,
  maxLength: number,
  required = false
): string {
  if (typeof value !== "string") {
    if (required) throw new Error("INVALID_CHECKOUT_DETAILS");
    return "";
  }

  const result = value.trim().replace(/[\u0000-\u001f\u007f]/g, " ");
  if ((required && !result) || result.length > maxLength) {
    throw new Error("INVALID_CHECKOUT_DETAILS");
  }
  return result;
}

function parseCheckoutRequest(value: unknown): CheckoutRequest {
  if (!isRecord(value) || !isRecord(value.billing)) {
    throw new Error("INVALID_CHECKOUT_DETAILS");
  }

  const billingValue = value.billing;
  const billing: BillingInput = {
    firstName: readText(billingValue.firstName, 100, true),
    lastName: readText(billingValue.lastName, 100, true),
    company: readText(billingValue.company, 160),
    email: readText(billingValue.email, 254, true).toLowerCase(),
    phone: readText(billingValue.phone, 40, true),
    address1: readText(billingValue.address1, 200, true),
    address2: readText(billingValue.address2, 200),
    city: readText(billingValue.city, 100, true),
    state: readText(billingValue.state, 100),
    postcode: readText(billingValue.postcode, 24, true),
    country: readText(billingValue.country, 2, true).toUpperCase(),
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email)) {
    throw new Error("INVALID_CHECKOUT_DETAILS");
  }
  if (!/^[A-Z]{2}$/.test(billing.country)) {
    throw new Error("INVALID_CHECKOUT_DETAILS");
  }

  const requestId = readText(value.requestId, 36, true);
  const paymentMethod = readText(value.paymentMethod, 100, true);
  const couponCode = readText(value.couponCode, 100);
  if (
    !REQUEST_ID_PATTERN.test(requestId) ||
    !/^[a-zA-Z0-9_-]+$/.test(paymentMethod) ||
    (couponCode !== "" && !/^[^\u0000-\u001f\u007f]{1,100}$/u.test(couponCode))
  ) {
    throw new Error("INVALID_CHECKOUT_DETAILS");
  }

  return { requestId, paymentMethod, couponCode, billing };
}

function mapBilling(value: BillingInput) {
  return {
    first_name: value.firstName,
    last_name: value.lastName,
    company: value.company,
    email: value.email,
    phone: value.phone,
    address_1: value.address1,
    address_2: value.address2,
    city: value.city,
    state: value.state,
    postcode: value.postcode,
    country: value.country,
  };
}

function isEnabled(gateway: WooPaymentGateway) {
  return gateway.enabled === true || gateway.enabled === "yes";
}

function buildPaymentUrl(order: StoredWooOrder) {
  const baseUrl = process.env.WOOCOMMERCE_BASE_URL;
  if (!baseUrl || !Number.isSafeInteger(order.id) || order.id <= 0) {
    throw new Error("INVALID_WOOCOMMERCE_ORDER");
  }
  if (
    typeof order.order_key !== "string" ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(order.order_key)
  ) {
    throw new Error("INVALID_WOOCOMMERCE_ORDER");
  }

  const storeUrl = new URL(baseUrl);
  const paymentUrl = new URL(
    `checkout/order-pay/${order.id}/`,
    `${storeUrl.origin}${storeUrl.pathname.replace(/\/?$/, "/")}`
  );
  paymentUrl.searchParams.set("pay_for_order", "true");
  paymentUrl.searchParams.set("key", order.order_key);
  return paymentUrl.toString();
}

function hasExpectedRequestMetadata(
  order: StoredWooOrder,
  requestId: string
) {
  return order.meta_data?.some(
    (metadata) =>
      metadata.key === "ppr_checkout_request_id" &&
      metadata.value === requestId
  );
}

function hasExpectedCouponDiscount(
  order: StoredWooOrder,
  couponCode: string
) {
  const couponLine = order.coupon_lines?.find(
    (line) => line.code.toLowerCase() === couponCode.toLowerCase()
  );
  return (
    couponLine !== undefined &&
    Number(couponLine.discount) > 0 &&
    Number(order.discount_total) > 0
  );
}

async function createOrderWithCustomerRecovery(
  orderInput: CreateOrderInput,
  user: Awaited<ReturnType<typeof getCurrentUser>>
) {
  try {
    return await createOrder(orderInput);
  } catch (error) {
    if (
      !(error instanceof WooCommerceApiError) ||
      error.code !== "woocommerce_rest_invalid_customer_id" ||
      !user ||
      !orderInput.customer_id
    ) {
      throw error;
    }

    const nameParts = user.fullName.trim().split(/\s+/);
    const customer =
      (await findWooCustomerByEmail(user.email)) ??
      (await createWooCustomer({
        email: user.email,
        firstName: nameParts[0] ?? "",
        lastName: nameParts.slice(1).join(" "),
        businessName: user.businessName,
      }));

    user.woocommerceCustomerId = customer.id;
    await user.save();

    return createOrder({ ...orderInput, customer_id: customer.id });
  }
}

function fingerprint(
  request: CheckoutRequest,
  itemKeys: string[],
  quantities: number[]
) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        paymentMethod: request.paymentMethod,
        couponCode: request.couponCode.toLowerCase(),
        billing: request.billing,
        itemKeys,
        quantities,
      })
    )
    .digest("hex");
}

function fingerprintsMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function getOrderMetadata(item: {
  width: string;
  height: string;
  jobName: string;
  additionalService: string;
  orderNotes: string;
  productSize: string;
  customShape: string;
  productType: string;
  fullName: string;
  business: string;
  phone: string;
}) {
  const values: [string, string][] = [
    ["Width", item.width],
    ["Height", item.height],
    ["Job name", item.jobName],
    ["Additional service", item.additionalService],
    ["Order notes", item.orderNotes],
    ["Product size", item.productSize],
    ["Custom shape", item.customShape],
    ["Product type", item.productType],
    ["Contact name", item.fullName],
    ["Business", item.business],
    ["Phone", item.phone],
  ];
  return values
    .filter(([, value]) => value.length > 0)
    .map(([key, value]) => ({ key, value }));
}

async function loadEnabledPaymentGateways() {
  const gateways = await getPaymentGateways();
  if (!Array.isArray(gateways)) {
    throw new Error("INVALID_PAYMENT_GATEWAYS");
  }
  return gateways
    .filter(
      (gateway) =>
        isEnabled(gateway) &&
        typeof gateway.id === "string" &&
        /^[a-zA-Z0-9_-]+$/.test(gateway.id) &&
        typeof gateway.title === "string" &&
        gateway.title.length > 0
    )
    .map((gateway) => ({
      id: gateway.id,
      title: gateway.title,
      description:
        typeof gateway.description === "string"
          ? gateway.description.replace(/<[^>]*>/g, "").slice(0, 500)
          : "",
    }));
}

export async function GET() {
  try {
    const [paymentMethods, user] = await Promise.all([
      loadEnabledPaymentGateways(),
      getCurrentUser(),
    ]);

    return json({
      success: true,
      paymentMethods,
      customer: user
        ? {
            fullName: user.fullName,
            email: user.email,
            phone: user.phone ?? "",
          }
        : null,
    });
  } catch (error) {
    console.error("GET_CHECKOUT_OPTIONS_ERROR:", error);
    return json(
      {
        success: false,
        message: "Payment methods are temporarily unavailable.",
      },
      503
    );
  }
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return json({ success: false, message: "Invalid checkout request." }, 403);
  }

  let checkoutRequest: CheckoutRequest;
  try {
    const rawBody = await readRequestBody(request, MAX_CHECKOUT_BODY_BYTES);
    checkoutRequest = parseCheckoutRequest(JSON.parse(rawBody) as unknown);
  } catch (error) {
    return json(
      {
        success: false,
        message:
          error instanceof RequestBodyTooLargeError
            ? "Checkout details are too large."
            : error instanceof Error &&
          error.message === "INVALID_CHECKOUT_DETAILS"
            ? "Enter valid contact and billing details."
            : "Invalid checkout request.",
      },
      error instanceof RequestBodyTooLargeError ? 413 : 400
    );
  }

  try {
    const owner = await getCartOwner(false);
    if (!owner) {
      return json(
        { success: false, message: "Your cart could not be found." },
        404
      );
    }

    const cart = await getCart(owner);
    if (!cart?.items.length) {
      return json({ success: false, message: "Your cart is empty." }, 400);
    }

    if (
      cart.items.some(
        (item) =>
          typeof item.productId !== "number" ||
          !Number.isSafeInteger(item.productId) ||
          item.productId <= 0 ||
          !Number.isSafeInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > 10000
      )
    ) {
      return json(
        {
          success: false,
          message:
            "One or more cart items are not linked to a purchasable WooCommerce product.",
        },
        400
      );
    }

    const gateways = await loadEnabledPaymentGateways();
    const gateway = gateways.find(
      (item) => item.id === checkoutRequest.paymentMethod
    );
    if (!gateway) {
      return json(
        {
          success: false,
          message: "That payment method is no longer available.",
        },
        400
      );
    }

    await connectDB();
    const itemKeys = cart.items.map((item) => item.key);
    const quantities = cart.items.map((item) => item.quantity);
    const requestFingerprint = fingerprint(
      checkoutRequest,
      itemKeys,
      quantities
    );

    let attempt = await CheckoutTransaction.findOne({
      ownerType: owner.type,
      ownerId: owner.id,
      requestId: checkoutRequest.requestId,
    });

    if (attempt) {
      if (
        !fingerprintsMatch(
          attempt.requestFingerprint,
          requestFingerprint
        )
      ) {
        return json(
          {
            success: false,
            message:
              "Checkout details changed. Start a new checkout attempt.",
          },
          409
        );
      }

      if (attempt.status === "creating") {
        return json(
          {
            success: false,
            message:
              "This checkout is already being processed. Please wait before retrying.",
          },
          409
        );
      }

      if (attempt.wooCommerceOrderId) {
        const order = await getWooOrder<StoredWooOrder>(
          attempt.wooCommerceOrderId
        );
        if (!hasExpectedRequestMetadata(order, attempt.requestId)) {
          return json(
            { success: false, message: "Checkout could not be verified." },
            409
          );
        }

        return json({
          success: true,
          transactionId: attempt.requestId,
          orderNumber: attempt.wooCommerceOrderId,
          paymentUrl:
            attempt.status === "pending" || attempt.status === "processing"
              ? buildPaymentUrl(order)
              : null,
          status: attempt.status,
        });
      }

      return json(
        {
          success: false,
          message:
            "This checkout attempt cannot be reused. Start a new checkout attempt.",
        },
        409
      );
    }

    const activeAttempt = await CheckoutTransaction.findOne({
      ownerType: owner.type,
      ownerId: owner.id,
      status: { $in: ["creating", "pending", "processing"] },
    }).select("requestId");
    if (activeAttempt) {
      if (checkoutRequest.couponCode) {
        return json(
          {
            success: false,
            message:
              "You already have a checkout awaiting payment. Complete or cancel it before starting another checkout with a coupon.",
          },
          409
        );
      }
      return json(
        {
          success: false,
          message: "You already have a checkout awaiting payment.",
          activeTransactionId: activeAttempt.requestId,
        },
        409
      );
    }

    const user = await getCurrentUser();
    const coupon = checkoutRequest.couponCode
      ? await validateCheckoutCoupon(
          checkoutRequest.couponCode,
          cart.items.map((item) => {
            if (typeof item.productId !== "number") {
              throw new Error("INVALID_CART_PRODUCT");
            }
            return item.productId;
          }),
          quantities,
          checkoutRequest.billing.email
        )
      : null;
    if (checkoutRequest.couponCode && !coupon) {
      return json(
        {
          success: false,
          message:
            "This coupon is no longer valid for your cart. Check the code and try again.",
        },
        400
      );
    }

    const wooCustomerId = Number(user?.woocommerceCustomerId);
    const isCashOnDelivery = gateway.id === "cod";

    try {
      attempt = await CheckoutTransaction.create({
        ownerType: owner.type,
        ownerId: owner.id,
        requestId: checkoutRequest.requestId,
        requestFingerprint,
        status: "creating",
        gatewayId: gateway.id,
        gatewayTitle: gateway.title,
        paymentTransactionId: "",
        amount: "",
        currency: "",
        itemKeys,
        items: cart.items.map((item) => ({
          ...item,
          artworks: item.artworks.map((artwork) => ({
            fileName: artwork.fileName,
            contentType: artwork.contentType,
            data: Buffer.from(artwork.data),
          })),
        })),
        expiresAt: new Date(Date.now() + ATTEMPT_RETENTION_MS),
      });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === 11000
      ) {
        const active = await CheckoutTransaction.findOne({
          ownerType: owner.type,
          ownerId: owner.id,
          status: { $in: ["creating", "pending", "processing"] },
        }).select("requestId");
        return json(
          {
            success: false,
            message:
              "You already have a checkout awaiting payment.",
            ...(active ? { activeTransactionId: active.requestId } : {}),
          },
          409
        );
      }
      throw error;
    }

    try {
      const artworkUploads = await Promise.all(
        cart.items.map((item, itemIndex) =>
          Promise.all(
            item.artworks.map((artwork, artworkIndex) =>
              uploadWordPressMedia(
                artwork,
                `${checkoutRequest.requestId}-${itemIndex + 1}-${artworkIndex + 1}`
              )
            )
          )
        )
      );
      const lineItems: CreateOrderInput["line_items"] = cart.items.map(
        (item, itemIndex) => {
          if (typeof item.productId !== "number") {
            throw new Error("INVALID_CART_PRODUCT");
          }
          return {
            product_id: item.productId,
            quantity: item.quantity,
            meta_data: [
              ...getOrderMetadata(item),
              ...artworkUploads[itemIndex].map((artwork, artworkIndex) => ({
                key: `Artwork ${artworkIndex + 1}: ${artwork.fileName}`.slice(
                  0,
                  120
                ),
                value: artwork.url,
              })),
            ],
          };
        }
      );
      const orderInput: CreateOrderInput = {
        ...(Number.isSafeInteger(wooCustomerId) && wooCustomerId > 0
          ? { customer_id: wooCustomerId }
          : {}),
        ...(isCashOnDelivery
          ? { status: coupon ? ("pending" as const) : ("processing" as const) }
          : {}),
        payment_method: gateway.id,
        payment_method_title: gateway.title,
        set_paid: false,
        billing: mapBilling(checkoutRequest.billing),
        shipping: {
          first_name: checkoutRequest.billing.firstName,
          last_name: checkoutRequest.billing.lastName,
          company: checkoutRequest.billing.company,
          address_1: checkoutRequest.billing.address1,
          address_2: checkoutRequest.billing.address2,
          city: checkoutRequest.billing.city,
          state: checkoutRequest.billing.state,
          postcode: checkoutRequest.billing.postcode,
          country: checkoutRequest.billing.country,
        },
        line_items: lineItems,
        ...(coupon ? { coupon_lines: [{ code: coupon.code }] } : {}),
        meta_data: [
          {
            key: "ppr_checkout_request_id",
            value: checkoutRequest.requestId,
          },
        ],
      };
      const order = await createOrderWithCustomerRecovery(orderInput, user);
      if (
        coupon &&
        !hasExpectedCouponDiscount(order, coupon.code)
      ) {
        try {
          await cancelOrder(order.id);
        } catch (cancelError) {
          console.error("WOOCOMMERCE_COUPON_ORDER_CANCEL_ERROR:", cancelError);
        }
        throw new Error("CHECKOUT_COUPON_NOT_APPLIED");
      }
      if (
        !hasExpectedRequestMetadata(order, checkoutRequest.requestId) ||
        (!isCashOnDelivery && order.needs_payment === false)
      ) {
        throw new Error("INVALID_WOOCOMMERCE_ORDER");
      }

      if (isCashOnDelivery && coupon) {
        await updateOrderStatus(order.id, "processing");
      }

      const paymentUrl = isCashOnDelivery ? null : buildPaymentUrl(order);
      const update = await CheckoutTransaction.updateOne(
        { _id: attempt._id, status: "creating" },
        {
          $set: {
            wooCommerceOrderId: order.id,
            amount: order.total,
            currency: order.currency,
            status: isCashOnDelivery ? "placed" : "pending",
          },
        }
      );

      const savedAttempt = await CheckoutTransaction.findById(attempt._id);
      if (!savedAttempt || (update.matchedCount === 0 && !savedAttempt.wooCommerceOrderId)) {
        throw new Error("CHECKOUT_STATE_SAVE_FAILED");
      }

      if (isCashOnDelivery && savedAttempt.status === "placed") {
        await Cart.updateOne(
          {
            ownerType: owner.type,
            ownerId: owner.id,
          },
          {
            $pull: {
              items: {
                $or: cart.items.map((item) => ({
                  key: item.key,
                  quantity: item.quantity,
                })),
              },
            },
            ...(owner.type === "guest"
              ? { $set: { expiresAt: new Date(Date.now() + 30 * 86400000) } }
              : {}),
          }
        );
      }

      return json({
        success: true,
        transactionId: savedAttempt.requestId,
        orderNumber: order.id,
        amount: order.total,
        currency: order.currency,
        gatewayTitle: gateway.title,
        paymentUrl:
          paymentUrl &&
          (savedAttempt.status === "pending" ||
            savedAttempt.status === "processing")
            ? paymentUrl
            : null,
        status: savedAttempt.status,
      });
    } catch (error) {
      console.error("WOOCOMMERCE_CHECKOUT_CREATE_ERROR:", error);
      await CheckoutTransaction.updateOne(
        { _id: attempt._id, status: "creating" },
        { $set: { status: "failed" } }
      );
      return json(
        {
          success: false,
          message:
            (error instanceof Error &&
              error.message === "CHECKOUT_COUPON_NOT_APPLIED") ||
            (error instanceof WooCommerceApiError &&
              /coupon/i.test(error.code))
              ? "WooCommerce could not apply this coupon, so no payment link was created. Check the coupon and try again."
              : "We could not start payment. Check your cart and try checkout again.",
        },
        (error instanceof Error &&
          error.message === "CHECKOUT_COUPON_NOT_APPLIED") ||
          (error instanceof WooCommerceApiError && /coupon/i.test(error.code))
          ? 400
          : 502
      );
    }
  } catch (error) {
    console.error("CHECKOUT_ERROR:", error);
    return json(
      {
        success: false,
        message: "Checkout is temporarily unavailable. Please try again.",
      },
      500
    );
  }
}
