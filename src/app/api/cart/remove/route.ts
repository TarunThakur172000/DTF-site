import {
  removeCartItem,
} from "@/lib/server/woocommerce/cart";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const key = String(body.key ?? "");

    if (!key) {
      return Response.json(
        {
          error:
            "Cart item key is required",
        },
        {
          status: 400,
        }
      );
    }

    const cartToken =
      request.headers.get(
        "x-cart-token"
      ) ?? undefined;

    const result =
      await removeCartItem({
        key,
        cartToken,
      });

    return Response.json(
      result.data,
      {
        headers: {
          ...(result.cartToken
            ? {
                "x-cart-token":
                  result.cartToken,
              }
            : {}),
        },
      }
    );
  } catch (error) {
    console.error(
      "Remove cart item error:",
      error
    );

    return Response.json(
      {
        error:
          "Unable to remove cart item",
      },
      {
        status: 500,
      }
    );
  }
}