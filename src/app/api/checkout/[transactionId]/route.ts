import { getCartOwner } from "@/lib/server/cart";
import { getWooOrder } from "@/lib/server/woocommerce/client";
import CheckoutTransaction from "@/models/CheckoutTransaction";
import type { CreateOrderResponse } from "@/lib/server/woocommerce/orders";

export const dynamic = "force-dynamic";

interface StoredWooOrder extends CreateOrderResponse {
  meta_data?: { key: string; value: unknown }[];
}

function isOwnedWooOrder(order: StoredWooOrder, requestId: string) {
  return order.meta_data?.some(
    (metadata) =>
      metadata.key === "ppr_checkout_request_id" &&
      metadata.value === requestId
  );
}

function buildPaymentUrl(order: StoredWooOrder) {
  const baseUrl = process.env.WOOCOMMERCE_BASE_URL;
  if (
    !baseUrl ||
    !Number.isSafeInteger(order.id) ||
    order.id <= 0 ||
    typeof order.order_key !== "string" ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(order.order_key)
  ) {
    throw new Error("INVALID_WOOCOMMERCE_ORDER");
  }

  const storeUrl = new URL(baseUrl);
  const paymentUrl = new URL(
    `checkout/order-pay/${order.id}/`,
    `${storeUrl.origin}${storeUrl.pathname.replace(/\/?$/, "/")}`
  );
  paymentUrl.searchParams.set("pay_for_order", "true");
  paymentUrl.searchParams.set("key", order.order_key);
  return paymentUrl.toString();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        transactionId
      )
    ) {
      return Response.json(
        { success: false, message: "Transaction not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const owner = await getCartOwner(false);
    if (!owner) {
      return Response.json(
        { success: false, message: "Transaction not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const transaction = await CheckoutTransaction.findOne({
      ownerType: owner.type,
      ownerId: owner.id,
      requestId: transactionId,
    }).select(
      "requestId status wooCommerceOrderId gatewayId gatewayTitle paymentTransactionId amount currency items.key items.artworks.fileName"
    );

    if (!transaction) {
      return Response.json(
        { success: false, message: "Transaction not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    let paymentUrl: string | null = null;
    const includePayment = new URL(request.url).searchParams.get("payment");
    if (
      includePayment === "1" &&
      transaction.wooCommerceOrderId &&
      (transaction.status === "pending" || transaction.status === "processing")
    ) {
      const order = await getWooOrder<StoredWooOrder>(
        transaction.wooCommerceOrderId
      );
      if (!isOwnedWooOrder(order, transaction.requestId)) {
        return Response.json(
          { success: false, message: "Transaction not found." },
          { status: 404, headers: { "Cache-Control": "no-store" } }
        );
      }
      paymentUrl = buildPaymentUrl(order);
    }

    return Response.json(
      {
        success: true,
        transaction: {
          id: transaction.requestId,
          status: transaction.status,
          orderNumber: transaction.wooCommerceOrderId ?? null,
          paymentMethod: transaction.gatewayTitle,
          paymentTransactionId:
            transaction.gatewayId === "cod"
              ? null
              : transaction.paymentTransactionId || null,
          amount: transaction.amount || null,
          currency: transaction.currency || null,
          paymentUrl,
          isCashOnDelivery: transaction.gatewayId === "cod",
          isGuest: owner.type === "guest",
          artworks: transaction.items.flatMap((item, itemIndex) =>
            item.artworks.map((artwork, artworkIndex) => ({
              fileName: artwork.fileName,
              url: `/api/checkout/${encodeURIComponent(transaction.requestId)}/artwork/${itemIndex}/${artworkIndex}`,
            }))
          ),
        },
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("GET_CHECKOUT_TRANSACTION_ERROR:", error);
    return Response.json(
      { success: false, message: "Unable to load payment status." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
