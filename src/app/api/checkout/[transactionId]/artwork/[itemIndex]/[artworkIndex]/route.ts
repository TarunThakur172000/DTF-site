import { getCartOwner } from "@/lib/server/cart";
import CheckoutTransaction from "@/models/CheckoutTransaction";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{
      transactionId: string;
      itemIndex: string;
      artworkIndex: string;
    }>;
  }
) {
  try {
    const { transactionId, itemIndex, artworkIndex } = await params;
    const itemPosition = Number(itemIndex);
    const artworkPosition = Number(artworkIndex);

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        transactionId
      ) ||
      !Number.isSafeInteger(itemPosition) ||
      itemPosition < 0 ||
      !Number.isSafeInteger(artworkPosition) ||
      artworkPosition < 0
    ) {
      return new Response("Not found", { status: 404 });
    }

    const owner = await getCartOwner(false);
    if (!owner) {
      return new Response("Not found", { status: 404 });
    }

    const transaction = await CheckoutTransaction.findOne({
      requestId: transactionId,
      ownerType: owner.type,
      ownerId: owner.id,
    }).select("items");
    const artwork = transaction?.items[itemPosition]?.artworks[artworkPosition];

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
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (error) {
    console.error("GET_CHECKOUT_ARTWORK_ERROR:", error);
    return new Response("Unable to download artwork", { status: 500 });
  }
}
