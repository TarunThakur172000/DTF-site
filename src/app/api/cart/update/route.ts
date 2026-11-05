import {
  cartErrorResponse,
  getCart,
  getCartOwner,
  refreshGuestCart,
} from "@/lib/server/cart";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return Response.json(
        { success: false, message: "Invalid cart update." },
        { status: 400 }
      );
    }

    const { key, quantity } = body as { key?: unknown; quantity?: unknown };
    if (typeof key !== "string" || !/^[0-9a-f-]{36}$/i.test(key)) {
      return Response.json(
        { success: false, message: "Invalid cart item key." },
        { status: 400 }
      );
    }

    if (
      typeof quantity !== "number" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 10000
    ) {
      return Response.json(
        { success: false, message: "Quantity must be between 1 and 10,000." },
        { status: 400 }
      );
    }

    const owner = await getCartOwner(false);
    if (!owner) {
      return Response.json(
        { success: false, message: "Cart not found." },
        { status: 404 }
      );
    }

    const cart = await getCart(owner);
    if (!cart) {
      return Response.json(
        { success: false, message: "Cart item not found." },
        { status: 404 }
      );
    }

    const item = cart.items.find((cartItem) => cartItem.key === key);
    if (!item) {
      return Response.json(
        { success: false, message: "Cart item not found." },
        { status: 404 }
      );
    }

    item.quantity = quantity;
    refreshGuestCart(cart, owner);
    await cart.save();

    return Response.json({ success: true });
  } catch (error) {
    const cartResponse = cartErrorResponse(error);
    if (cartResponse) {
      return cartResponse;
    }

    console.error("UPDATE_CART_ITEM_ERROR:", error);
    return Response.json(
      { success: false, message: "Unable to update cart item." },
      { status: 500 }
    );
  }
}
