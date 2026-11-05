import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title="Secure checkout"
        description="Review your cart and choose an enabled WooCommerce payment method."
        crumbs={[{ label: "Checkout" }]}
      />
      <div className="container-px section-py">
        <CheckoutClient />
      </div>
    </>
  );
}
