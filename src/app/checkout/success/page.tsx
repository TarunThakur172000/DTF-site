import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { LinkButton } from "../../../components/ui/Button";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccessPage() {
  const orderNumber = `PPR-${Math.floor(10000 + Math.random() * 89999)}`;

  return (
    <section className="bg-surfaceMuted min-h-[calc(100vh-5rem)] flex items-center">
      <div className="container-px w-full py-16">
        <div className="mx-auto max-w-lg text-center rounded-3xl bg-white border border-primary-50 shadow-card p-10">
          <CheckCircle2 className="mx-auto text-success-600" size={48} />
          <h1 className="mt-5 text-2xl md:text-3xl font-bold tracking-tight">Order confirmed!</h1>
          <p className="mt-3 text-primary-400">
            Thanks for your order. A confirmation email is on its way. Your order number is:
          </p>
          <p className="mt-4 font-display text-xl font-bold text-accent-600">{orderNumber}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <LinkButton to="/dashboard/orders" variant="secondary">View Order</LinkButton>
            <LinkButton to="/">Back to Home</LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
