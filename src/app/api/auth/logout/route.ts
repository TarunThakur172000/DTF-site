import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // 1. Destroy the WooCommerce JWT cookie so the cart resets
    cookieStore.delete("wp_jwt");

    // 2. Destroy your MongoDB custom session cookie 
    // Note: If you named your session cookie something else during your 
    // login route (like "auth_session"), make sure to use that name here!
    cookieStore.delete("session"); 

    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
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