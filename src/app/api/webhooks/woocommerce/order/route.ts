import { NextResponse } from "next/server";
import crypto from "crypto";

import { connectDB } from "@/lib/server/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import CheckoutTransaction from "@/models/CheckoutTransaction";
import {
  readRequestBody,
  RequestBodyTooLargeError,
} from "@/lib/server/request-body";

export const runtime = "nodejs";

interface WooWebhookLineItem {
  product_id: number;
  variation_id?: number;
  name: string;
  quantity: number;
  price?: number;
  subtotal?: string;
  total?: string;
  sku?: string;
  image?: { src?: string };
}

interface WooWebhookOrder {
  id: number;
  status: string;
  customer_id: number;
  currency?: string;
  total?: string;
  total_tax?: string;
  date_created?: string;
  date_modified?: string;
  transaction_id?: string;
  payment_method?: string;
  payment_method_title?: string;
  meta_data?: { key: string; value: unknown }[];
  line_items?: WooWebhookLineItem[];
  billing?: Record<string, string | undefined>;
  shipping?: Record<string, string | undefined>;
}

function verifyWooCommerceSignature(
  rawBody: string,
  signature: string | null
) {
  const secret = process.env.WOOCOMMERCE_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  );
}

export async function POST(request: Request) {
  try {
    // IMPORTANT:
    // Read raw body BEFORE JSON.parse()
    // because WooCommerce signs the raw request body.
    const rawBody = await readRequestBody(request, 2 * 1024 * 1024);

    const signature = request.headers.get(
      "x-wc-webhook-signature"
    );

    const topic = request.headers.get(
      "x-wc-webhook-topic"
    );
    if (
      topic !== "order.created" &&
      topic !== "order.updated" &&
      topic !== "order.deleted"
    ) {
      return NextResponse.json(
        { success: false, message: "Unsupported webhook topic." },
        { status: 400 }
      );
    }

    if (
      !verifyWooCommerceSignature(
        rawBody,
        signature
      )
    ) {
      console.error("Invalid WooCommerce webhook signature");

      return NextResponse.json(
        {
          success: false,
          message: "Invalid webhook signature.",
        },
        { status: 401 }
      );
    }

    let wooOrder: WooWebhookOrder;
    try {
      wooOrder = JSON.parse(rawBody) as WooWebhookOrder;
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid order payload." },
        { status: 400 }
      );
    }

    if (
      !Number.isSafeInteger(wooOrder.id) ||
      wooOrder.id <= 0 ||
      typeof wooOrder.status !== "string" ||
      !Number.isSafeInteger(wooOrder.customer_id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order payload.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const requestId = wooOrder.meta_data?.find(
      (entry) => entry.key === "ppr_checkout_request_id"
    )?.value;
    const checkoutTransaction =
      typeof requestId === "string"
        ? await CheckoutTransaction.findOne({
            requestId,
            $or: [
              { wooCommerceOrderId: { $exists: false } },
              { wooCommerceOrderId: wooOrder.id },
            ],
          })
        : await CheckoutTransaction.findOne({
            wooCommerceOrderId: wooOrder.id,
          });

    if (checkoutTransaction) {
      const modifiedTimestamp = Date.parse(wooOrder.date_modified || "");
      const modifiedAt = new Date(
        Number.isFinite(modifiedTimestamp) ? modifiedTimestamp : Date.now()
      );
      const canApplyUpdate =
        !checkoutTransaction.wooOrderModifiedAt ||
        modifiedAt >= checkoutTransaction.wooOrderModifiedAt;

      if (canApplyUpdate) {
        const isCashOnDelivery = checkoutTransaction.gatewayId === "cod";
        const orderStatus = isCashOnDelivery
          ? ["cancelled", "refunded", "trash"].includes(wooOrder.status)
            ? "cancelled"
            : wooOrder.status === "failed"
              ? "failed"
              : ["processing", "completed"].includes(wooOrder.status)
                ? "placed"
                : checkoutTransaction.status
          : ["processing", "completed"].includes(wooOrder.status)
            ? "paid"
            : wooOrder.status === "failed"
              ? "failed"
              : ["cancelled", "refunded", "trash"].includes(wooOrder.status)
                ? "cancelled"
                : ["pending", "on-hold"].includes(wooOrder.status)
                  ? "pending"
                  : checkoutTransaction.status;
        const finalStatus =
          !isCashOnDelivery &&
          checkoutTransaction.status === "paid" &&
          orderStatus !== "paid"
            ? "paid"
            : orderStatus;

        if (
          (finalStatus === "paid" || finalStatus === "placed") &&
          checkoutTransaction.itemKeys.length
        ) {
          await Cart.updateOne(
            {
              ownerType: checkoutTransaction.ownerType,
              ownerId: checkoutTransaction.ownerId,
            },
            {
              $pull: {
                items: {
                  $or: checkoutTransaction.items.map((item) => ({
                    key: item.key,
                    quantity: item.quantity,
                  })),
                },
              },
              ...(checkoutTransaction.ownerType === "guest"
                ? { $set: { expiresAt: new Date(Date.now() + 30 * 86400000) } }
                : {}),
            }
          );
        }

        checkoutTransaction.status = finalStatus;
        checkoutTransaction.wooCommerceOrderId = wooOrder.id;
        checkoutTransaction.paymentTransactionId =
          !isCashOnDelivery && typeof wooOrder.transaction_id === "string"
            ? wooOrder.transaction_id.slice(0, 200)
            : "";
        checkoutTransaction.amount =
          typeof wooOrder.total === "string" ? wooOrder.total : "";
        checkoutTransaction.currency =
          typeof wooOrder.currency === "string" ? wooOrder.currency : "";
        checkoutTransaction.wooOrderModifiedAt = modifiedAt;
        await checkoutTransaction.save();
      }
    }

    // Find our MongoDB user using the WooCommerce customer ID
    const user =
      checkoutTransaction?.ownerType === "user"
        ? await User.findById(checkoutTransaction.ownerId)
        : checkoutTransaction?.ownerType === "guest"
          ? null
          : await User.findOne({
              woocommerceCustomerId: wooOrder.customer_id,
            });

    if (!user) {
      if (checkoutTransaction?.ownerType === "guest") {
        return NextResponse.json({ success: true }, { status: 200 });
      }

      console.warn(
        `No MongoDB user found for WooCommerce customer ${wooOrder.customer_id}`
      );

      // Return 200 so WooCommerce doesn't repeatedly retry
      // an event that we intentionally cannot associate.
      return NextResponse.json(
        {
          success: true,
          message: "Customer not mapped.",
        },
        { status: 200 }
      );
    }

    const subtotal = wooOrder.line_items
      ?.reduce((sum, item) => sum + Number(item.subtotal || 0), 0)
      .toFixed(2);

    const lineItems =
      wooOrder.line_items?.map((item) => ({
        productId: item.product_id,
        variationId: item.variation_id || 0,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price || 0),
        subtotal: item.subtotal || "0",
        total: item.total || "0",
        sku: item.sku || "",
        image: item.image?.src || "",
      })) || [];

    const orderModifiedAt = new Date(
      wooOrder.date_modified || Date.now()
    );
    const existingOrder = await Order.findOne({
      wooCommerceOrderId: wooOrder.id,
    }).select("dateModified");

    if (
      !existingOrder ||
      orderModifiedAt.getTime() >= existingOrder.dateModified.getTime()
    ) {
      await Order.findOneAndUpdate(
      {
        wooCommerceOrderId: wooOrder.id,
      },
      {
        $set: {
          userId: user._id,

          wooCommerceOrderId: wooOrder.id,
          wooCommerceCustomerId:
            wooOrder.customer_id,

          status: wooOrder.status,

          currency: wooOrder.currency,

          subtotal: subtotal || "0.00",
          totalTax: wooOrder.total_tax || "0",
          total: wooOrder.total || "0",

          paymentMethod:
            wooOrder.payment_method || "",

          paymentMethodTitle:
            wooOrder.payment_method_title || "",

          paymentTransactionId:
            wooOrder.transaction_id || "",
          checkoutTransactionId:
            checkoutTransaction?.requestId || "",

          dateCreated: new Date(
            wooOrder.date_created || Date.now()
          ),

          dateModified: new Date(
            orderModifiedAt
          ),

          billing: {
            firstName:
              wooOrder.billing?.first_name || "",
            lastName:
              wooOrder.billing?.last_name || "",
            company:
              wooOrder.billing?.company || "",
            address1:
              wooOrder.billing?.address_1 || "",
            address2:
              wooOrder.billing?.address_2 || "",
            city: wooOrder.billing?.city || "",
            state: wooOrder.billing?.state || "",
            postcode:
              wooOrder.billing?.postcode || "",
            country:
              wooOrder.billing?.country || "",
            email:
              wooOrder.billing?.email || "",
            phone:
              wooOrder.billing?.phone || "",
          },

          shipping: {
            firstName:
              wooOrder.shipping?.first_name || "",
            lastName:
              wooOrder.shipping?.last_name || "",
            company:
              wooOrder.shipping?.company || "",
            address1:
              wooOrder.shipping?.address_1 || "",
            address2:
              wooOrder.shipping?.address_2 || "",
            city:
              wooOrder.shipping?.city || "",
            state:
              wooOrder.shipping?.state || "",
            postcode:
              wooOrder.shipping?.postcode || "",
            country:
              wooOrder.shipping?.country || "",
          },

          lineItems,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
      );
    }

    console.log(
      `WooCommerce ${topic}: Order ${wooOrder.id} synchronized`
    );

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json(
        { success: false, message: "Webhook payload is too large." },
        { status: 413 }
      );
    }
    console.error(
      "WOOCOMMERCE_ORDER_WEBHOOK_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}