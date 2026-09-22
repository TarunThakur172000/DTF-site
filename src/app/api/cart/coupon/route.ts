import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { wooCommerceFetch } from "@/lib/server/woocommerce/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const code = body.code?.trim();

    if (!code) {
      return NextResponse.json(
        { message: "Coupon code is required" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const cartToken = cookieStore.get("woo_cart_token")?.value;

    const result = await wooCommerceFetch(
      `/cart/apply-coupon?code=${encodeURIComponent(code)}`,
      {
        method: "POST",
      },
      cartToken
    );

    if (result.cartToken) {
      cookieStore.set("woo_cart_token", result.cartToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Apply coupon error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to apply coupon",
      },
      { status: 500 }
    );
  }
}