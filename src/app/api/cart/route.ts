import {
  getCart,
  getCartOwner,
  refreshGuestCart,
  toCartResponse,
} from "@/lib/server/cart";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const owner = await getCartOwner();
    if (!owner) {
      return Response.json(
        { success: false, message: "Unable to identify cart owner." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const cart = await getCart(owner);
    return Response.json(toCartResponse(cart), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("GET_CART_ERROR:", error);
    return Response.json(
      { success: false, message: "Unable to fetch cart." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const owner = await getCartOwner(false);
    if (!owner) {
      return Response.json(
        { success: false, message: "Cart not found." },
        { status: 404 }
      );
    }

    const cart = await getCart(owner);
    if (!cart) {
      return Response.json({ success: true, items: [] });
    }

    const itemKey = new URL(request.url).searchParams.get("key");
    if (itemKey) {
      if (!/^[0-9a-f-]{36}$/i.test(itemKey)) {
        return Response.json(
          { success: false, message: "Invalid cart item key." },
          { status: 400 }
        );
      }

      const itemIndex = cart.items.findIndex((item) => item.key === itemKey);
      if (itemIndex < 0) {
        return Response.json(
          { success: false, message: "Cart item not found." },
          { status: 404 }
        );
      }
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items.splice(0, cart.items.length);
    }

    refreshGuestCart(cart, owner);
    await cart.save();

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE_CART_ERROR:", error);
    return Response.json(
      { success: false, message: "Unable to modify cart." },
      { status: 500 }
    );
  }
}
