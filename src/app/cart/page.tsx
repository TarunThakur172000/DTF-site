import type { Metadata } from "next";
import { PageHero } from "../../components/sections/PageHero";
import { CartClient } from "../../components/cart/CartClient";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <>
      <PageHero
        eyebrow="Your Cart"
        title="Review your order"
        description="Double-check quantities before heading to checkout."
        crumbs={[{ label: "Cart" }]}
      />
      <div className="container-px section-py">
        <CartClient />
      </div>
    </>
  );
}
