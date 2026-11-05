"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PaymentStatus {
  id: string;
  status:
    | "creating"
    | "pending"
    | "processing"
    | "placed"
    | "paid"
    | "failed"
    | "cancelled";
  orderNumber: number | null;
  paymentMethod: string;
  paymentTransactionId: string | null;
  amount: string | null;
  currency: string | null;
  paymentUrl: string | null;
  isCashOnDelivery: boolean;
  artworks: { fileName: string; url: string }[];
  isGuest: boolean;
}

export function PaymentStatusClient({
  transactionId,
}: {
  transactionId: string;
}) {
  const [transaction, setTransaction] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    async function refresh(includePaymentUrl: boolean) {
      try {
        const query = includePaymentUrl ? "?payment=1" : "";
        const response = await fetch(
          `/api/checkout/${encodeURIComponent(transactionId)}${query}`,
          { cache: "no-store" }
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load payment status.");
        }

        if (!active) return;
        setTransaction((current) => ({
          ...(data.transaction as PaymentStatus),
          paymentUrl:
            data.transaction.paymentUrl ?? current?.paymentUrl ?? null,
        }));
        setError("");

        const needsPaymentLink =
          includePaymentUrl &&
          !data.transaction.paymentUrl &&
          (data.transaction.status === "pending" ||
            data.transaction.status === "processing");
        if (
          data.transaction.status !== "paid" &&
          data.transaction.status !== "placed" &&
          data.transaction.status !== "failed" &&
          data.transaction.status !== "cancelled"
        ) {
          timer = setTimeout(
            () => void refresh(needsPaymentLink),
            5000
          );
        }
      } catch (statusError) {
        if (!active) return;
        setError(
          statusError instanceof Error
            ? statusError.message
            : "Unable to load payment status."
        );
        timer = setTimeout(() => void refresh(includePaymentUrl), 10000);
      }
    }

    void refresh(true);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [transactionId]);

  if (error && !transaction) {
    return (
      <div role="alert" className="space-y-4 text-center">
        <p className="text-red-600">{error}</p>
        <Link href="/cart" className="font-semibold text-accent-600 hover:underline">
          Return to cart
        </Link>
      </div>
    );
  }

  if (!transaction) {
    return <p className="text-center text-primary-500">Checking payment status…</p>;
  }

  if (transaction.status === "paid" || transaction.status === "placed") {
    const isCashOnDelivery = transaction.status === "placed";
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold text-success-600">
          {isCashOnDelivery ? "Order placed" : "Payment received"}
        </h2>
        <p className="text-primary-600">
          {isCashOnDelivery
            ? "Your order is confirmed. Payment is due on delivery; no online payment has been recorded."
            : "Your payment was confirmed by WooCommerce."}
        </p>
        {transaction.orderNumber && (
          <p className="text-sm text-primary-500">
            Order number: <strong>#{transaction.orderNumber}</strong>
          </p>
        )}
        {!isCashOnDelivery && transaction.paymentTransactionId && (
          <p className="break-all text-sm text-primary-500">
            Payment transaction ID:{" "}
            <strong>{transaction.paymentTransactionId}</strong>
          </p>
        )}
        {transaction.artworks.length > 0 && (
          <div className="space-y-2 border-t border-primary-50 pt-4 text-left">
            <p className="text-sm font-semibold">Your artwork files</p>
            {transaction.artworks.map((artwork) => (
              <a
                key={artwork.url}
                href={artwork.url}
                className="block break-all text-sm text-accent-600 hover:underline"
              >
                Download {artwork.fileName}
              </a>
            ))}
          </div>
        )}
        {transaction.isGuest ? (
          <Link href="/promotional-products" className="inline-block font-semibold text-accent-600 hover:underline">
            Continue shopping
          </Link>
        ) : (
          <Link href="/dashboard/orders" className="inline-block font-semibold text-accent-600 hover:underline">
            View your orders
          </Link>
        )}
      </div>
    );
  }

  if (transaction.status === "failed" || transaction.status === "cancelled") {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold">
          {transaction.isCashOnDelivery
            ? "Order was not completed"
            : "Payment was not completed"}
        </h2>
        <p className="text-primary-500">
          {transaction.isCashOnDelivery
            ? "This Cash on Delivery order is no longer active. Check your cart before placing another order."
            : "No successful payment was recorded. Your cart is still available."}
        </p>
        <Link href="/checkout" className="font-semibold text-accent-600 hover:underline">
          Try checkout again
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-center">
      <h2 className="text-2xl font-bold">Payment pending</h2>
      <p className="text-primary-500">
        {transaction.orderNumber
          ? `Order #${transaction.orderNumber} is waiting for payment confirmation.`
          : "Your order is being prepared."}
        {" "}This page updates when WooCommerce confirms the payment.
      </p>
      {error && (
        <p role="status" className="text-sm text-amber-700">
          {error}
        </p>
      )}
      {transaction.paymentUrl && (
        <a
          href={transaction.paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
          className="inline-flex rounded-xl bg-accent-600 px-6 py-3 font-semibold text-white hover:bg-accent-700"
        >
          Pay securely with {transaction.paymentMethod}
        </a>
      )}
      {!transaction.paymentUrl && transaction.status === "pending" && (
        <p className="text-sm text-primary-500">
          The secure payment page is temporarily unavailable. This page will
          keep checking your transaction.
        </p>
      )}
      <p className="text-xs text-primary-400">
        Do not share your checkout reference. Reference: {transaction.id}
      </p>
    </div>
  );
}
