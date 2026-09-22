import { NextResponse } from "next/server";
import crypto from "crypto";

import { connectDB } from "@/lib/server/db";
import User from "@/models/User";
import Order from "@/models/Order";

export const runtime = "nodejs";

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
    const rawBody = await request.text();

    const signature = request.headers.get(
      "x-wc-webhook-signature"
    );

    const topic = request.headers.get(
      "x-wc-webhook-topic"
    );

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

    const wooOrder = JSON.parse(rawBody);

    if (!wooOrder?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order payload.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Find our MongoDB user using the WooCommerce customer ID
    const user = await User.findOne({
      woocommerceCustomerId: wooOrder.customer_id,
    });

    if (!user) {
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
      ?.reduce(
        (sum: number, item: any) =>
          sum + Number(item.subtotal || 0),
        0
      )
      .toFixed(2);

    const lineItems =
      wooOrder.line_items?.map((item: any) => ({
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

          dateCreated: new Date(
            wooOrder.date_created
          ),

          dateModified: new Date(
            wooOrder.date_modified
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