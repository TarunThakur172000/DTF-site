import { getCart, getCartOwner } from "@/lib/server/cart";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ itemKey: string; index: string }> }
) {
  try {
    const { itemKey, index: indexValue } = await params;
    const index = Number(indexValue);

    if (
      !/^[0-9a-f-]{36}$/i.test(itemKey) ||
      !Number.isInteger(index) ||
      index < 0
    ) {
      return new Response("Not found", { status: 404 });
    }

    const owner = await getCartOwner(false);
    if (!owner) {
      return new Response("Not found", { status: 404 });
    }

    const cart = await getCart(owner);
    const item = cart?.items.find((cartItem) => cartItem.key === itemKey);
    const artwork = item?.artworks[index];

    if (!artwork) {
      return new Response("Not found", { status: 404 });
    }

    const fileName = artwork.fileName
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 120);

    return new Response(new Uint8Array(artwork.data), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("CART_ARTWORK_DOWNLOAD_ERROR:", error);
    return new Response("Unable to download artwork", { status: 500 });
  }
}
