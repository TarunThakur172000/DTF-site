import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/server/auth/session";
import { getCustomerOrder } from "@/lib/server/woocommerce/orders";
import { orderIdSchema } from "@/lib/server/validation/order";

interface RouteParams {
  params: Promise<{
    orderId: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    // 1. Authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    // 2. Make sure the user has a WooCommerce customer account
    if (!user.woocommerceCustomerId) {
      return NextResponse.json(
        {
          success: false,
          message: "WooCommerce customer not found.",
        },
        { status: 404 }
      );
    }

    // 3. Get order ID from URL
    const { orderId } = await params;

    // 4. Server-side validation
    const result = orderIdSchema.safeParse(orderId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID.",
        },
        { status: 400 }
      );
    }

    const parsedOrderId = result.data;

    // 5. Authorization
    // getCustomerOrder verifies that this order
    // belongs to the authenticated WooCommerce customer.
    const order = await getCustomerOrder(
      user.woocommerceCustomerId,
      parsedOrderId
    );

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    // 6. Return order
    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET_ORDER_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch order.",
      },
      { status: 500 }
    );
  }
}