"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";

interface CheckoutItem {
  id: number | null;
  name: string;
  quantity: number;
  width: string;
  height: string;
  jobName: string;
  productSize: string;
  artworkCount: number;
}

interface PaymentMethod {
  id: string;
  title: string;
  description: string;
}

interface CheckoutCoupon {
  code: string;
  description: string;
  discountLabel: string;
}

interface BillingForm {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

interface CheckoutOptions {
  success: boolean;
  paymentMethods: PaymentMethod[];
  customer: { fullName: string; email: string; phone: string } | null;
  message?: string;
}

interface CartResponse {
  success: boolean;
  items: CheckoutItem[];
  message?: string;
}

const EMPTY_BILLING: BillingForm = {
  firstName: "",
  lastName: "",
  company: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postcode: "",
  country: "",
};

export function CheckoutClient() {
  const router = useRouter();
  const requestId = useRef<string | null>(null);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<CheckoutCoupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<CheckoutCoupon | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponNotice, setCouponNotice] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [billing, setBilling] = useState(EMPTY_BILLING);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCheckout() {
      try {
        const [cartResponse, optionsResponse, couponsResponse] = await Promise.all([
          fetch("/api/cart", { cache: "no-store" }),
          fetch("/api/checkout", { cache: "no-store" }),
          fetch("/api/checkout/coupons", { cache: "no-store" }),
        ]);
        const [cartData, optionsData, couponsData] = await Promise.all([
          cartResponse.json() as Promise<CartResponse>,
          optionsResponse.json() as Promise<CheckoutOptions>,
          couponsResponse.json() as Promise<{
            success: boolean;
            coupons?: CheckoutCoupon[];
            message?: string;
          }>,
        ]);

        if (!cartResponse.ok || !cartData.success) {
          throw new Error(cartData.message || "Unable to load your cart.");
        }
        if (!optionsResponse.ok || !optionsData.success) {
          throw new Error(
            optionsData.message || "Payment methods are unavailable."
          );
        }

        setCart(cartData);
        setPaymentMethods(optionsData.paymentMethods);
        if (couponsResponse.ok && couponsData.success) {
          setAvailableCoupons(couponsData.coupons ?? []);
        } else {
          setCouponNotice(
            couponsData.message ?? "Available coupons could not be loaded."
          );
        }
        setSelectedMethod(optionsData.paymentMethods[0]?.id ?? "");

        if (optionsData.customer) {
          const nameParts = optionsData.customer.fullName.trim().split(/\s+/);
          setBilling((current) => ({
            ...current,
            firstName: nameParts.shift() ?? "",
            lastName: nameParts.join(" "),
            email: optionsData.customer?.email ?? "",
            phone: optionsData.customer?.phone ?? "",
          }));
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load checkout."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadCheckout();
  }, []);

  function updateBilling(field: keyof BillingForm, value: string) {
    requestId.current = null;
    if (field === "email") {
      setAppliedCoupon(null);
      setCouponCode("");
      setCouponError("");
    }
    setBilling((current) => ({ ...current, [field]: value }));
  }

  async function applyCoupon(code = couponCode) {
    const normalizedCode = code.trim();
    if (!normalizedCode) return;
    if (!billing.email.trim()) {
      setCouponError("Enter your email before applying a coupon.");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");
      setCouponNotice("");
      const response = await fetch("/api/checkout/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ code: normalizedCode, email: billing.email }),
      });
      const result = await response.json();
      if (!response.ok || !result.success || !result.coupon) {
        throw new Error(result.message || "This coupon cannot be applied.");
      }

      requestId.current = null;
      setAppliedCoupon(result.coupon as CheckoutCoupon);
      setCouponCode(result.coupon.code);
    } catch (applyError) {
      setAppliedCoupon(null);
      setCouponError(
        applyError instanceof Error
          ? applyError.message
          : "Coupon validation is temporarily unavailable."
      );
    } finally {
      setCouponLoading(false);
    }
  }

  async function submitCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedMethod) {
      setError("Select an available payment method.");
      return;
    }

    requestId.current ??= crypto.randomUUID();

    try {
      setSubmitting(true);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          requestId: requestId.current,
          paymentMethod: selectedMethod,
          couponCode: appliedCoupon?.code ?? "",
          billing,
        }),
      });
      const result = await response.json();

      if (result.activeTransactionId) {
        router.push(
          `/checkout/success?transaction=${encodeURIComponent(result.activeTransactionId)}`
        );
        return;
      }

      if (!response.ok || !result.success || !result.transactionId) {
        requestId.current = null;
        throw new Error(result.message || "Unable to start checkout.");
      }

      router.push(
        `/checkout/success?transaction=${encodeURIComponent(result.transactionId)}`
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to start checkout."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="py-16 text-center text-primary-400">Loading checkout…</p>;
  }

  if (error && !cart) {
    return (
      <div role="alert" className="py-16 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!cart?.items.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-primary-700">Your cart is empty.</p>
        <a
          href="/cart"
          className="mt-4 inline-block font-semibold text-accent-600 hover:underline"
        >
          Return to cart
        </a>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-3">
      <form
        onSubmit={submitCheckout}
        className="space-y-6 lg:col-span-2"
        autoComplete="on"
      >
        <Card className="space-y-5 p-6">
          <div>
            <h2 className="text-lg font-semibold">Contact and billing details</h2>
            <p className="mt-1 text-sm text-primary-500">
              Payment is processed by the selected WooCommerce payment provider.
              Card details are never entered or stored on this site.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" required>
              <input
                className={INPUT_CLASS}
                autoComplete="given-name"
                required
                maxLength={100}
                value={billing.firstName}
                onChange={(event) => updateBilling("firstName", event.target.value)}
              />
            </Field>
            <Field label="Last name" required>
              <input
                className={INPUT_CLASS}
                autoComplete="family-name"
                required
                maxLength={100}
                value={billing.lastName}
                onChange={(event) => updateBilling("lastName", event.target.value)}
              />
            </Field>
            <Field label="Email" required>
              <input
                className={INPUT_CLASS}
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={billing.email}
                onChange={(event) => updateBilling("email", event.target.value)}
              />
            </Field>
            <Field label="Phone" required>
              <input
                className={INPUT_CLASS}
                type="tel"
                autoComplete="tel"
                required
                maxLength={40}
                value={billing.phone}
                onChange={(event) => updateBilling("phone", event.target.value)}
              />
            </Field>
            <Field label="Company">
              <input
                className={INPUT_CLASS}
                autoComplete="organization"
                maxLength={160}
                value={billing.company}
                onChange={(event) => updateBilling("company", event.target.value)}
              />
            </Field>
            <Field label="Country code (2 letters)" required>
              <input
                className={INPUT_CLASS}
                autoComplete="country"
                required
                minLength={2}
                maxLength={2}
                pattern="[A-Za-z]{2}"
                placeholder="US"
                value={billing.country}
                onChange={(event) => updateBilling("country", event.target.value)}
              />
            </Field>
            <Field label="Address" required>
              <input
                className={INPUT_CLASS}
                autoComplete="address-line1"
                required
                maxLength={200}
                value={billing.address1}
                onChange={(event) => updateBilling("address1", event.target.value)}
              />
            </Field>
            <Field label="Apartment, suite, etc.">
              <input
                className={INPUT_CLASS}
                autoComplete="address-line2"
                maxLength={200}
                value={billing.address2}
                onChange={(event) => updateBilling("address2", event.target.value)}
              />
            </Field>
            <Field label="City" required>
              <input
                className={INPUT_CLASS}
                autoComplete="address-level2"
                required
                maxLength={100}
                value={billing.city}
                onChange={(event) => updateBilling("city", event.target.value)}
              />
            </Field>
            <Field label="State / province">
              <input
                className={INPUT_CLASS}
                autoComplete="address-level1"
                maxLength={100}
                value={billing.state}
                onChange={(event) => updateBilling("state", event.target.value)}
              />
            </Field>
            <Field label="Postal code" required>
              <input
                className={INPUT_CLASS}
                autoComplete="postal-code"
                required
                maxLength={24}
                value={billing.postcode}
                onChange={(event) => updateBilling("postcode", event.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Payment method</h2>
          {paymentMethods.length === 0 ? (
            <p className="text-sm text-red-600">
              No enabled WooCommerce payment methods are available.
            </p>
          ) : (
            paymentMethods.map((method) => (
              <label
                key={method.id}
                className="flex cursor-pointer gap-3 rounded-xl border border-primary-100 p-4"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => {
                    requestId.current = null;
                    setSelectedMethod(method.id);
                  }}
                  required
                />
                <span>
                  <span className="block font-semibold">{method.title}</span>
                  {method.description && (
                    <span className="mt-1 block text-sm text-primary-500">
                      {method.description}
                    </span>
                  )}
                </span>
              </label>
            ))
          )}
        </Card>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || paymentMethods.length === 0}
          className="w-full rounded-xl bg-accent-600 px-6 py-3 font-semibold text-white hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating secure order…" : "Continue to secure payment"}
        </button>
      </form>

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Order summary</h2>
        <div className="space-y-3 border-b border-primary-50 pb-4">
          <label className="block text-sm font-medium text-primary-800" htmlFor="checkout-coupon">
            Coupon code
          </label>
          <div className="flex gap-2">
            <input
              id="checkout-coupon"
              className={INPUT_CLASS}
              value={couponCode}
              maxLength={100}
              autoComplete="off"
              placeholder="Enter coupon code"
              onChange={(event) => {
                setCouponCode(event.target.value);
                setAppliedCoupon(null);
                setCouponError("");
                requestId.current = null;
              }}
            />
            <button
              type="button"
              onClick={() => void applyCoupon()}
              disabled={couponLoading || !couponCode.trim()}
              className="shrink-0 rounded-lg bg-primary-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {couponLoading ? "Checking…" : "Apply"}
            </button>
          </div>
          {appliedCoupon && (
            <p className="text-sm text-green-700" role="status">
              {appliedCoupon.code} applied ({appliedCoupon.discountLabel}).
              It will be checked again before payment.
            </p>
          )}
          {couponError && (
            <p className="text-sm text-red-600" role="alert">{couponError}</p>
          )}
          {couponNotice && (
            <p className="text-sm text-amber-700" role="status">{couponNotice}</p>
          )}
          {availableCoupons.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">
                Available for this cart
              </p>
              {availableCoupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="flex items-center justify-between gap-3 rounded-lg border border-primary-100 p-3"
                >
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold">{coupon.code} · {coupon.discountLabel}</p>
                    {coupon.description && (
                      <p className="mt-1 break-words text-primary-500">
                        {coupon.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCouponCode(coupon.code);
                      void applyCoupon(coupon.code);
                    }}
                    disabled={couponLoading || appliedCoupon?.code === coupon.code}
                    className="shrink-0 text-sm font-semibold text-accent-700 hover:underline disabled:opacity-50"
                  >
                    {appliedCoupon?.code === coupon.code ? "Applied" : "Use"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <ul className="divide-y divide-primary-50">
          {cart.items.map((item, index) => (
            <li
              key={`${item.id ?? "item"}-${index}`}
              className="flex justify-between gap-4 py-3 text-sm"
            >
              <span>
                <span className="block font-medium text-primary-900">
                  {item.name} × {item.quantity}
                </span>
                {(item.width || item.height || item.productSize) && (
                  <span className="mt-1 block text-primary-500">
                    {[item.width, item.height, item.productSize]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
                {item.artworkCount > 0 && (
                  <span className="mt-1 block text-primary-500">
                    {item.artworkCount} artwork file
                    {item.artworkCount === 1 ? "" : "s"}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="border-t border-primary-50 pt-4 text-sm text-primary-500">
          WooCommerce calculates the final item prices, taxes, and shipping.
          Review the total on the secure payment page before paying.
        </p>
      </Card>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-primary-800">
        {label}{required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

const INPUT_CLASS =
  "w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm focus:border-accent-600 focus:outline-none";
