"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

/* =========================================================
   TYPES
========================================================= */

type CustomCartItem = {
  key: string;
  id: number;
  quantity: number;
  name?: string;

  width: string;
  height: string;
  jobName: string;

  additionalService?: string;
  orderNotes?: string;
  fileUrl?: string;

  prices?: {
    price: string;
    line_total: string;
    currency_symbol: string;
  };
};

type CustomCartResponse = {
  success: boolean;

  items: CustomCartItem[];

  totals?: {
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
    currency_symbol: string;
  };

  cartCount?: number;
  message?: string;
};

type PaymentMethod = {
  id: string;
  title: string;
  description?: string;
};

interface CheckoutValues {
  email: string;

  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}


function decodeHtmlEntities(value: string) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

/* =========================================================
   CHECKOUT CLIENT
========================================================= */

export function CheckoutClient() {
  const [savedAddress, setSavedAddress] =
  useState<{
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email?: string;
    phone?: string;
  } | null>(null);

  const [editingAddress, setEditingAddress] = useState(false);

const [addressLoading, setAddressLoading] = useState(true);

  const router = useRouter();

  const [cart, setCart] =
    useState<CustomCartResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [checkoutError, setCheckoutError] =
    useState<string | null>(null);

  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("");
  const [paymentMethodsLoading, setPaymentMethodsLoading] =
    useState(true);
  const [paymentMethodsError, setPaymentMethodsError] =
    useState<string | null>(null);

const {
  register,
  handleSubmit,
  setValue,
  formState: { errors, isSubmitting },
} = useForm<CheckoutValues>();

  /* =======================================================
     LOAD CART
  ======================================================= */

  async function loadCart() {
    try {
      setLoading(true);
      setCheckoutError(null);

      const response = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load cart");
      }

      const json: CustomCartResponse =
        await response.json();
      
      if (!json.success) {
        throw new Error(
          json.message || "Invalid cart data"
        );
      }
      console.log("Cart loaded:", json);
      setCart(json);
    } catch (error) {
      console.error(
        "Failed to load cart:",
        error
      );

      setCart(null);

      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Failed to load your cart."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     LOAD CART WHEN CHECKOUT PAGE OPENS
  ======================================================= */

  useEffect(() => {
  loadCart();
  loadSavedAddress();
    loadPaymentMethods();
}, []);

  async function loadPaymentMethods() {
    try {
      setPaymentMethodsLoading(true);
      setPaymentMethodsError(null);

      const response = await fetch("/api/payment-methods", {
        method: "GET",
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load payment methods.");
      }

      const methods = (result.paymentMethods ?? []) as PaymentMethod[];
      setPaymentMethods(methods);
      setSelectedPaymentMethod(methods[0]?.id ?? "");

      if (methods.length === 0) {
        setPaymentMethodsError("No payment methods are currently available.");
      }
    } catch (error) {
      setPaymentMethodsError(
        error instanceof Error
          ? error.message
          : "Unable to load payment methods."
      );
    } finally {
      setPaymentMethodsLoading(false);
    }
  }

async function loadSavedAddress() {
  try {
    setAddressLoading(true);

    const response = await fetch(
      "/api/account/addresses",
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to load saved address."
      );
    }

    const address = result.shipping || result.billing;

    if (address) {
      setSavedAddress(address);

      // Prefill React Hook Form
      setValue(
        "fullName",
        `${address.first_name || ""} ${
          address.last_name || ""
        }`.trim()
      );

      setValue(
        "address",
        [
          address.address_1,
          address.address_2,
        ]
          .filter(Boolean)
          .join(", ")
      );

      setValue("city", address.city || "");
      setValue("state", address.state || "");
      setValue("zip", address.postcode || "");
      setValue("country", address.country || "US");

      if (address.email) {
        setValue("email", address.email);
      }
    }
  } catch (error) {
    console.error(
      "LOAD_SAVED_ADDRESS_ERROR:",
      error
    );
  } finally {
    setAddressLoading(false);
  }
}
  /* =======================================================
     CART ITEMS
  ======================================================= */

  const items = cart?.items ?? [];

  /* =======================================================
     SUBTOTAL
     
     Your current API gives us:
     
     prices.price
     
     So we're calculating the displayed subtotal here.

     IMPORTANT:
     This should NOT be trusted for creating the final
     WooCommerce order. WooCommerce/backend should calculate
     the final amount again.
  ======================================================= */

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number(
        item.prices?.price ?? 0
      );

      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  /*
    These are placeholders until your WooCommerce checkout
    endpoint returns the real shipping/tax values.

    Do NOT use these values to create the final order.
  */

  const shipping = 0;
  const tax = 0;

  const total =
    subtotal + shipping + tax;

  /* =======================================================
     CHECKOUT HANDLER
  ======================================================= */

  const onSubmit = async (
    data: CheckoutValues
  ) => {
    try {
      setCheckoutError(null);

      if (!selectedPaymentMethod) {
        throw new Error("Select a payment method to continue.");
      }

      /*
       * =====================================================
       * STEP 1
       * =====================================================
       *
       * Eventually payment provider integration goes here.
       *
       * Example:
       *
       * Stripe:
       *
       * const result =
       *   await stripe.confirmPayment(...)
       *
       * OR PayPal:
       *
       * const paymentToken = ...
       *
       * You should NOT send raw card information to your
       * own backend.
       */

      /*
       * =====================================================
       * STEP 2
       * =====================================================
       *
       * Send customer information to your backend.
       *
       * Your backend will then:
       *
       * 1. Get the WooCommerce cart/session
       * 2. Validate the cart
       * 3. Apply billing/shipping information
       * 4. Process payment
       * 5. Create WooCommerce order
       * 6. Return order information
       */

      const response = await fetch(
        "/api/checkout",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            customer: {
              email: data.email,

              first_name:
                data.fullName.split(" ")[0] || "",

              last_name:
                data.fullName
                  .split(" ")
                  .slice(1)
                  .join(" ") || "",

              address_1: data.address,

              city: data.city,

              state: data.state,

              postcode: data.zip,

              country: data.country,
            },
            paymentMethodId: selectedPaymentMethod,
          }),
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Checkout failed"
        );
      }

      if (selectedPaymentMethod === "cod") {
        router.push(`/checkout/success?order=${result.orderId}`);
        return;
      }

      if (!result.payUrl) {
        throw new Error("WooCommerce did not return a payment URL.");
      }

      window.location.assign(result.payUrl);
    } catch (error) {
      console.error(
        "Checkout failed:",
        error
      );

      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Something went wrong during checkout."
      );
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20">
        <div className="flex items-center justify-center gap-3">
          <Loader2
            size={20}
            className="animate-spin"
          />

          <span className="text-primary-400">
            Loading checkout...
          </span>
        </div>
      </div>
    );
  }

  /* =======================================================
     EMPTY CART
  ======================================================= */

  if (!loading && items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <Card className="p-8 text-center">
          <h1 className="font-display font-semibold text-2xl">
            Your cart is empty
          </h1>

          <p className="mt-2 text-primary-400">
            Add some products to your cart before
            checking out.
          </p>

          <Button
            type="button"
            className="mt-6"
            onClick={() => router.push("/")}
          >
            Continue Shopping
          </Button>
        </Card>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid lg:grid-cols-3 gap-8 items-start"
    >
      {/* ===================================================
          LEFT SIDE
      =================================================== */}

      <div className="lg:col-span-2 space-y-6">

        {/* =================================================
            CONTACT
        ================================================= */}

        <Card className="p-6">
          <h2 className="font-display font-semibold text-lg">
            Contact
          </h2>

          <div className="mt-4">
            <Field
              label="Email"
              error={errors.email?.message}
            >
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="form-input"
                {...register("email", {
                  required:
                    "Email is required",

                  pattern: {
                    value:
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

                    message:
                      "Enter a valid email address",
                  },
                })}
              />
            </Field>
          </div>
        </Card>

        {/* =================================================
            SHIPPING ADDRESS
        ================================================= */}

      <Card className="p-6">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="font-display font-semibold text-lg">
        Shipping address
      </h2>

      {!editingAddress && (
        <p className="mt-1 text-sm text-primary-400">
          Your saved shipping address
        </p>
      )}
    </div>

    {!editingAddress && savedAddress && (
      <button
        type="button"
        onClick={() => setEditingAddress(true)}
        className="text-sm font-semibold text-accent-600 hover:underline"
      >
        Change
      </button>
    )}
  </div>

  {!editingAddress ? (
    /* =========================
       SAVED ADDRESS
       ========================= */
    <div className="mt-5">
      {addressLoading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-40 rounded bg-primary-50" />
          <div className="h-4 w-64 rounded bg-primary-50" />
          <div className="h-4 w-48 rounded bg-primary-50" />
        </div>
      ) : savedAddress ? (
        <div className="rounded-lg border border-primary-100 bg-primary-50 p-4 text-sm leading-6">
          <p className="font-semibold text-primary-900">
            {savedAddress.first_name}{" "}
            {savedAddress.last_name}
          </p>

          <p>{savedAddress.address_1}</p>

          {savedAddress.address_2 && (
            <p>{savedAddress.address_2}</p>
          )}

          <p>
            {savedAddress.city},{" "}
            {savedAddress.state}{" "}
            {savedAddress.postcode}
          </p>

          <p>{savedAddress.country}</p>

          {savedAddress.phone && (
            <p className="mt-2">
              {savedAddress.phone}
            </p>
          )}
        </div>
      ) : (
        <div>
          <p className="text-sm text-primary-400">
            No saved shipping address found.
          </p>

          <button
            type="button"
            onClick={() => setEditingAddress(true)}
            className="mt-3 text-sm font-semibold text-accent-600 hover:underline"
          >
            Add address
          </button>
        </div>
      )}
    </div>
  ) : (
    /* =========================
       EDIT ADDRESS
       ========================= */
    <div className="mt-5 grid sm:grid-cols-2 gap-4">

      {/* FULL NAME */}
      <div className="sm:col-span-2">
        <Field
          label="Full name"
          error={errors.fullName?.message}
        >
          <input
            className="form-input"
            autoComplete="name"
            {...register("fullName", {
              required: "Full name is required",
            })}
          />
        </Field>
      </div>

      {/* ADDRESS */}
      <div className="sm:col-span-2">
        <Field
          label="Street address"
          error={errors.address?.message}
        >
          <input
            className="form-input"
            autoComplete="street-address"
            {...register("address", {
              required: "Address is required",
            })}
          />
        </Field>
      </div>

      {/* CITY */}
      <Field
        label="City"
        error={errors.city?.message}
      >
        <input
          className="form-input"
          autoComplete="address-level2"
          {...register("city", {
            required: "City is required",
          })}
        />
      </Field>

      {/* STATE */}
      <Field
        label="State"
        error={errors.state?.message}
      >
        <input
          className="form-input"
          autoComplete="address-level1"
          {...register("state", {
            required: "State is required",
          })}
        />
      </Field>

      {/* ZIP */}
      <Field
        label="ZIP"
        error={errors.zip?.message}
      >
        <input
          className="form-input"
          inputMode="numeric"
          autoComplete="postal-code"
          {...register("zip", {
            required: "ZIP is required",
          })}
        />
      </Field>

      {/* COUNTRY */}
      <Field
        label="Country"
        error={errors.country?.message}
      >
        <input
          className="form-input"
          autoComplete="country"
          {...register("country", {
            required: "Country is required",
          })}
        />
      </Field>

      {/* ACTIONS */}
      <div className="sm:col-span-2 flex gap-3 pt-2">

        <button
          type="button"
          onClick={() => setEditingAddress(false)}
          className="rounded-lg border border-primary-100 px-4 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => setEditingAddress(false)}
          className="rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Use this address
        </button>

      </div>
    </div>
  )}
</Card>

        {/* =================================================
            PAYMENT
        ================================================= */}

        <Card className="p-6">

          <div className="flex items-center justify-between">

            <h2 className="font-display font-semibold text-lg">
              Payment
            </h2>

            <span className="flex items-center gap-1.5 text-xs text-primary-400">
              <Lock size={12} />

              Secure checkout
            </span>

          </div>

          <div className="mt-4">
            {paymentMethodsLoading ? (
              <p className="text-sm text-primary-400">Loading payment methods...</p>
            ) : paymentMethodsError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {paymentMethodsError}
              </p>
            ) : (
              <fieldset className="space-y-3">
                <legend className="sr-only">Choose a payment method</legend>
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                      selectedPaymentMethod === method.id
                        ? "border-accent-600 bg-accent-50"
                        : "border-primary-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={() => setSelectedPaymentMethod(method.id)}
                      className="mt-1 accent-accent-600"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-primary-900">
                        {method.title}
                      </span>
                      {method.description && (
                        <span className="mt-1 block text-xs text-primary-400">
                          {method.description.replace(/<[^>]*>/g, " ").trim()}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
                <p className="flex items-center gap-2 text-xs text-primary-400">
                  <Lock size={12} />
                  Payment is completed securely on WooCommerce.
                </p>
              </fieldset>
            )}
          </div>

        </Card>

        {/* =================================================
            CHECKOUT ERROR
        ================================================= */}

        {checkoutError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {checkoutError}
          </div>
        )}

      </div>

      {/* ===================================================
          RIGHT SIDE
      =================================================== */}

      <Card className="p-6 sticky top-24">

        <h2 className="font-display font-semibold text-lg">
          Order Summary
        </h2>

        {/* =================================================
            CART ITEMS
        ================================================= */}

        <ul className="mt-4 space-y-4">

          {items.map((item) => {

            const price = Number(
              item.prices?.price ?? 0
            );

            const lineTotal =
              price * item.quantity;

            return (
              <li
                key={item.key}
                className="text-sm border-b border-primary-50 pb-4"
              >

                <div className="flex justify-between gap-4">

                  <div className="flex-1 min-w-0">

                    <p className="font-medium text-primary-900">
                      {item.name ||
                        item.jobName}
                    </p>

                    <p className="mt-1 text-primary-400">
                      Qty: {item.quantity}
                    </p>

                    <p className="text-primary-400">
                      Size: {item.width} ×{" "}
                      {item.height}
                    </p>

                    {item.additionalService && (
                      <p className="text-primary-400">
                        Service:{" "}
                        {item.additionalService}
                      </p>
                    )}

                  </div>
<span className="font-medium text-primary-900 whitespace-nowrap">
  {decodeHtmlEntities(item.prices?.currency_symbol ?? "$")}
  {lineTotal.toFixed(2)}
</span>

                </div>

              </li>
            );
          })}

        </ul>

        {/* =================================================
            TOTALS
        ================================================= */}

        <dl className="mt-5 pt-5 border-t border-primary-50 space-y-3 text-sm">

          <Row
            label="Subtotal"
            value={subtotal}
          />

          <Row
            label="Shipping"
            value={shipping}
          />

          <Row
            label="Tax"
            value={tax}
          />

        </dl>

        {/* =================================================
            TOTAL
        ================================================= */}

        <div className="mt-4 pt-4 border-t border-primary-50 flex items-center justify-between">

          <span className="font-semibold">
            Total
          </span>

          <span className="text-xl font-bold text-primary-900">

            $
            {total.toFixed(2)}

          </span>

        </div>

        {/* =================================================
            PLACE ORDER
        ================================================= */}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-6"
          disabled={
            isSubmitting ||
            loading ||
            paymentMethodsLoading ||
            !selectedPaymentMethod ||
            items.length === 0
          }
        >
          {isSubmitting
            ? "Processing..."
            : `Place Order — $${total.toFixed(2)}`}
        </Button>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-primary-400">

          <Lock size={12} />

          Secure checkout

        </div>

      </Card>
    </form>
  );
}

/* =========================================================
   ROW
========================================================= */

function Row({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between text-primary-400">

      <dt>{label}</dt>

      <dd className="text-primary-900 font-medium">
        ${value.toFixed(2)}
      </dd>

    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">

      <span className="text-sm font-semibold text-primary-900">
        {label}
      </span>

      <div className="mt-1.5">
        {children}
      </div>

      {error && (
        <span className="mt-1 block text-xs text-red-600">
          {error}
        </span>
      )}

    </label>
  );
}