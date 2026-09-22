import type { Metadata } from "next";
import { PageHero } from "../../components/sections/PageHero";
import { CheckoutClient } from "../../components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title="Complete your order"
        description="Shipping, payment, and review — all in one place."
        crumbs={[{ label: "Cart", to: "/cart" }, { label: "Checkout" }]}
      />
      <div className="container-px section-py">
        <CheckoutClient />
      </div>
    </>
  );
}
