import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/server/auth/session";
import { getCustomerOrders } from "@/lib/server/woocommerce/orders";

export async function GET() {
  try {
    // Get authenticated user from session
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

    // User has not been connected to WooCommerce yet
    if (!user.woocommerceCustomerId) {
      return NextResponse.json(
        {
          success: true,
          orders: [],
        },
        { status: 200 }
      );
    }

    const orders = await getCustomerOrders(
      user.woocommerceCustomerId
    );

    return NextResponse.json(
      {
        success: true,
        orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET_ORDERS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch orders.",
      },
      { status: 500 }
    );
  }
}