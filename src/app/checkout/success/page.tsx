import type { Metadata } from "next";
import { PaymentStatusClient } from "@/components/checkout/PaymentStatusClient";
import { PageHero } from "@/components/sections/PageHero";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Payment Status",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ transaction?: string | string[] }>;
}) {
  const params = await searchParams;
  const transactionId = Array.isArray(params.transaction)
    ? params.transaction[0]
    : params.transaction;
  const validTransactionId =
    transactionId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      transactionId
    )
      ? transactionId
      : null;

  return (
    <>
      <PageHero
        eyebrow="Order status"
        title="Track your order"
        description="Online payment is confirmed only after WooCommerce reports the completed transaction. Cash on delivery orders remain unpaid until delivery."
        crumbs={[{ label: "Order status" }]}
      />
      <section className="container-px section-py">
        <Card className="mx-auto max-w-2xl p-8">
          {validTransactionId ? (
            <PaymentStatusClient transactionId={validTransactionId} />
          ) : (
            <p role="alert" className="text-center text-red-600">
              This payment reference is invalid. Return to your cart to start
              checkout again.
            </p>
          )}
        </Card>
      </section>
    </>
  );
}
