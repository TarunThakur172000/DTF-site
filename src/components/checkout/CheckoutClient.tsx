"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { MOCK_CART } from "../../data/mock-account";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface CheckoutValues {
  email: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

const SHIPPING_FLAT = 9.99;
const TAX_RATE = 0.0725;

export function CheckoutClient() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>();

  const subtotal = useMemo(() => MOCK_CART.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), []);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + SHIPPING_FLAT + tax;

  const onSubmit = async () => {
    // TODO: replace with a real call to your order/payment endpoint, e.g.
    // await fetch("/api/checkout", { method: "POST", body: JSON.stringify(data) });
    await new Promise((r) => setTimeout(r, 1000));
    router.push("/checkout/success");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <h2 className="font-display font-semibold text-lg">Contact</h2>
          <div className="mt-4">
            <Field label="Email" error={errors.email?.message}>
              <input type="email" className="form-input" {...register("email", { required: "Email is required" })} />
            </Field>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-lg">Shipping address</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Full name" error={errors.fullName?.message}>
                <input className="form-input" {...register("fullName", { required: "Full name is required" })} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Street address" error={errors.address?.message}>
                <input className="form-input" {...register("address", { required: "Address is required" })} />
              </Field>
            </div>
            <Field label="City" error={errors.city?.message}>
              <input className="form-input" {...register("city", { required: "City is required" })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="State" error={errors.state?.message}>
                <input className="form-input" {...register("state", { required: "Required" })} />
              </Field>
              <Field label="ZIP" error={errors.zip?.message}>
                <input className="form-input" {...register("zip", { required: "Required" })} />
              </Field>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Payment</h2>
            <span className="flex items-center gap-1.5 text-xs text-primary-400">
              <Lock size={12} /> Secure checkout
            </span>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Card number" error={errors.cardNumber?.message}>
                <input
                  inputMode="numeric"
                  placeholder="1234 1234 1234 1234"
                  className="form-input"
                  {...register("cardNumber", { required: "Card number is required" })}
                />
              </Field>
            </div>
            <Field label="Expiry" error={errors.expiry?.message}>
              <input placeholder="MM/YY" className="form-input" {...register("expiry", { required: "Required" })} />
            </Field>
            <Field label="CVC" error={errors.cvc?.message}>
              <input inputMode="numeric" placeholder="123" className="form-input" {...register("cvc", { required: "Required" })} />
            </Field>
          </div>
        </Card>
      </div>

      <Card className="p-6 sticky top-24">
        <h2 className="font-display font-semibold text-lg">Order Summary</h2>
        <ul className="mt-4 space-y-3">
          {MOCK_CART.map((item) => (
            <li key={item.id} className="flex items-center gap-3 text-sm">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-surfaceMuted shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-primary-900 truncate">{item.name}</p>
                <p className="text-primary-400">Qty {item.quantity}</p>
              </div>
              <span className="font-medium text-primary-900">${(item.unitPrice * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 pt-5 border-t border-primary-50 space-y-3 text-sm">
          <Row label="Subtotal" value={subtotal} />
          <Row label="Shipping" value={SHIPPING_FLAT} />
          <Row label="Estimated tax" value={tax} />
        </dl>
        <div className="mt-4 pt-4 border-t border-primary-50 flex items-center justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold text-primary-900">${total.toFixed(2)}</span>
        </div>

        <Button type="submit" size="lg" className="w-full mt-6" disabled={isSubmitting}>
          {isSubmitting ? "Placing order…" : `Place Order — $${total.toFixed(2)}`}
        </Button>
      </Card>
    </form>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-primary-400">
      <dt>{label}</dt>
      <dd className="text-primary-900 font-medium">${value.toFixed(2)}</dd>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-primary-900">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
