import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/server/auth/session";

export const dynamic = "force-dynamic";

const WORDPRESS_URL = process.env.WOOCOMMERCE_BASE_URL;
const STORE_SECRET = process.env.WP_STORE_SECRET;

async function getAuthenticatedUserId() {
  const session = await getCurrentUser();

  if (!session?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session.id;
}

/**
 * GET /api/cart
 *
 * Fetch the logged-in user's cart from WordPress.
 */
export async function GET() {
  try {
    if (!WORDPRESS_URL) {
      throw new Error("WOOCOMMERCE_BASE_URL is missing");
    }

    if (!STORE_SECRET) {
      throw new Error("WP_STORE_SECRET is missing");
    }

    const userId = await getAuthenticatedUserId();

    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/mystore/v1/cart`,
      {
        method: "GET",
        headers: {
          "x-store-secret": STORE_SECRET,
          "x-user-id": userId,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "WordPress get cart error:",
        response.status,
        data
      );

      return Response.json(
        {
          success: false,
          message: data?.message || "Unable to fetch cart",
          error: data,
        },
        {
          status: response.status,
        }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error("Get cart API route error:", error);

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return Response.json(
        {
          success: false,
          message: "You must be logged in",
        },
        {
          status: 401,
        }
      );
    }

    return Response.json(
      {
        success: false,
        message: "Unable to fetch cart",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * DELETE /api/cart
 *
 * If ?key=xxx is provided:
 *     Remove one cart item.
 *
 * Otherwise:
 *     Clear the entire cart.
 */
export async function DELETE(request: Request) {
  try {
    if (!WORDPRESS_URL) {
      throw new Error("WOOCOMMERCE_BASE_URL is missing");
    }

    if (!STORE_SECRET) {
      throw new Error("WP_STORE_SECRET is missing");
    }

    const userId = await getAuthenticatedUserId();

    const url = new URL(request.url);
    const itemKey = url.searchParams.get("key");

    let endpoint: string;

    if (itemKey) {
      endpoint = `/wp-json/mystore/v1/cart/item?key=${encodeURIComponent(
        itemKey
      )}`;
    } else {
      endpoint = "/wp-json/mystore/v1/cart";
    }

    const response = await fetch(
      `${WORDPRESS_URL}${endpoint}`,
      {
        method: "DELETE",
        headers: {
          "x-store-secret": STORE_SECRET,
          "x-user-id": userId,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "WordPress delete cart error:",
        response.status,
        data
      );

      return Response.json(
        {
          success: false,
          message:
            data?.message || "Unable to modify cart",
          error: data,
        },
        {
          status: response.status,
        }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error(
      "Delete cart API route error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return Response.json(
        {
          success: false,
          message: "You must be logged in",
        },
        {
          status: 401,
        }
      );
    }

    return Response.json(
      {
        success: false,
        message: "Unable to modify cart",
      },
      {
        status: 500,
      }
    );
  }
}