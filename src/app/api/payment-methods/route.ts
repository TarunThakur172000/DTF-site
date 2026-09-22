import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/server/auth/session";
import { getPaymentMethods } from "@/lib/server/woocommerce/paymentMethods";

export async function GET() {
  try {
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

    const paymentMethods = await getPaymentMethods();

    return NextResponse.json({
      success: true,
      paymentMethods,
    });
  } catch (error) {
    console.error("GET_PAYMENT_METHODS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch payment methods.",
      },
      { status: 500 }
    );
  }
}