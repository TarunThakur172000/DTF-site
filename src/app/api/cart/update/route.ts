import {getCurrentUser} from "@/lib/server/auth/session";

const WORDPRESS_URL = process.env.WOOCOMMERCE_BASE_URL;
const STORE_SECRET = process.env.WP_STORE_SECRET;

export async function POST(request: Request) {
  try {
    if (!WORDPRESS_URL) {
      throw new Error("WOOCOMMERCE_BASE_URL is missing");
    }

    if (!STORE_SECRET) {
      throw new Error("WP_STORE_SECRET is missing");
    }

    const session = await getCurrentUser();

    if (!session?.id) {
      return Response.json(
        {
          success: false,
          message: "You must be logged in",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const key = String(body.key ?? "");
    const quantity = Number(body.quantity);

    if (!key) {
      return Response.json(
        {
          success: false,
          message: "Cart item key is required",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return Response.json(
        {
          success: false,
          message: "Invalid quantity",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/mystore/v1/cart/item/update`,
      {
        method: "POST",
        headers: {
          "x-store-secret": STORE_SECRET,
          "x-user-id": session.id,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          quantity,
        }),
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "WordPress update cart error:",
        response.status,
        data
      );

      return Response.json(
        {
          success: false,
          message:
            data?.message ||
            "Unable to update cart",
          error: data,
        },
        { status: response.status }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error(
      "Update cart error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Unable to update cart",
      },
      { status: 500 }
    );
  }
}