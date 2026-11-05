import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSession } from "@/lib/server/auth/session";
import { startGuestCart } from "@/lib/server/cart";

export async function POST() {
  try {
    const cookieStore = await cookies();

    await clearSession();
    cookieStore.delete("wp_jwt");
    cookieStore.delete("woo_cart_token");
    await startGuestCart();

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("LOGOUT_SERVER_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to log out properly" },
      { status: 500 }
    );
  }
}