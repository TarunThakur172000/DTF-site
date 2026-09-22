"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { LinkButton } from "../ui/Button";
import { Card } from "../ui/Card";

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
    currency_symbol: string;
  };
};

type CustomCartResponse = {
  success: boolean;
  items: CustomCartItem[];
  message?: string;
};

export function CartClient() {
  const [cart, setCart] = useState<CustomCartResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      setLoading(true);

      const response = await fetch("/api/cart", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load cart");
      }

      const json: CustomCartResponse = await response.json();

      if (json.success) {
        setCart(json);
      } else {
        throw new Error(
          json.message || "Invalid cart data format"
        );
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }

  async function updateQty(
    itemKey: string,
    quantity: number
  ) {
    if (quantity < 1) return;

    try {
      const response = await fetch("/api/cart/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: itemKey,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update quantity"
        );
      }

      await loadCart();

      window.dispatchEvent(
        new Event("cart-updated")
      );
    } catch (error) {
      console.error(
        "Failed to update quantity:",
        error
      );
    }
  }

  async function removeItem(itemKey: string) {
    try {
      const response = await fetch(
        `/api/cart?key=${encodeURIComponent(itemKey)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to remove item"
        );
      }

      await loadCart();

      window.dispatchEvent(
        new Event("cart-updated")
      );
    } catch (error) {
      console.error(
        "Failed to remove item:",
        error
      );
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-primary-400">
          Loading cart...
        </p>
      </div>
    );
  }

  if (
    !cart ||
    !cart.items ||
    cart.items.length === 0
  ) {
    return (
      <div className="text-center py-16">
        <ShoppingBag
          className="mx-auto text-primary-100"
          size={48}
        />

        <h2 className="mt-4 text-xl font-semibold">
          Your cart is empty
        </h2>

        <p className="mt-2 text-primary-400">
          Browse our products and add something
          to get started.
        </p>

        <LinkButton
          to="/promotional-products"
          className="mt-6 inline-flex"
        >
          Browse Products
        </LinkButton>
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (acc, item) => {
      const itemPrice = item.prices?.price
        ? Number(item.prices.price) / 100
        : 5.0;

      return acc + itemPrice * item.quantity;
    },
    0
  );

  const total = subtotal;

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {cart.items.map((item) => {
          const price = item.prices?.price
            ? Number(item.prices.price) / 100
            : 5.0;

          return (
            <Card
              key={item.key}
              className="p-4 flex gap-4 items-center"
            >
              {/* Product Icon */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-surfaceMuted shrink-0 flex items-center justify-center">
                <ShoppingBag
                  size={24}
                  className="text-primary-200"
                />
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary-900 truncate">
                  {item.name ||
                    "Custom Service Order"}
                </h3>

                <div className="mt-1 space-y-0.5 text-sm text-primary-500">
                  {item.width && (
                    <p>
                      <span className="font-medium text-primary-700">
                        Width:
                      </span>{" "}
                      {item.width}
                    </p>
                  )}

                  {item.height && (
                    <p>
                      <span className="font-medium text-primary-700">
                        Height:
                      </span>{" "}
                      {item.height}
                    </p>
                  )}

                  {item.jobName && (
                    <p className="truncate">
                      <span className="font-medium text-primary-700">
                        Job Name:
                      </span>{" "}
                      {item.jobName}
                    </p>
                  )}

                  {item.additionalService && (
                    <p>
                      <span className="font-medium text-primary-700">
                        Service:
                      </span>{" "}
                      {item.additionalService}
                    </p>
                  )}

                  {item.orderNotes && (
                    <p className="truncate">
                      <span className="font-medium text-primary-700">
                        Notes:
                      </span>{" "}
                      {item.orderNotes}
                    </p>
                  )}

                  {item.fileUrl && (
                    <p>
                      <span className="font-medium text-primary-700">
                        Design File:
                      </span>{" "}
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent-600 hover:underline"
                      >
                        View File
                      </a>
                    </p>
                  )}
                </div>

                <p className="mt-2 font-semibold text-accent-600">
                  ${price.toFixed(2)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateQty(
                      item.key,
                      item.quantity - 1
                    )
                  }
                  disabled={item.quantity <= 1}
                  aria-label="Decrease quantity"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-primary-100 hover:border-accent-600 hover:text-accent-600 disabled:opacity-40"
                >
                  <Minus size={14} />
                </button>

                <span className="w-6 text-center font-medium">
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    updateQty(
                      item.key,
                      item.quantity + 1
                    )
                  }
                  aria-label="Increase quantity"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-primary-100 hover:border-accent-600 hover:text-accent-600"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() =>
                  removeItem(item.key)
                }
                aria-label="Remove item"
                className="text-primary-400 hover:text-red-600 shrink-0"
              >
                <Trash2 size={18} />
              </button>
            </Card>
          );
        })}
      </div>

      {/* Order Summary */}
      <Card className="p-6 sticky top-24">
        <h2 className="font-display font-semibold text-lg">
          Order Summary
        </h2>

        <dl className="mt-5 space-y-3 text-sm">
          <Row
            label="Subtotal"
            value={subtotal}
          />

          <Row
            label="Shipping"
            value={0}
          />

          <Row
            label="Tax"
            value={0}
          />
        </dl>

        <div className="mt-4 pt-4 border-t border-primary-50 flex items-center justify-between">
          <span className="font-semibold">
            Total
          </span>

          <span className="text-xl font-bold text-primary-900">
            ${total.toFixed(2)}
          </span>
        </div>

        <LinkButton
          to="/checkout"
          size="lg"
          className="w-full mt-6 justify-center"
        >
          Proceed to Checkout
        </LinkButton>

        <Link
          href="/promotional-products"
          className="block text-center text-sm text-primary-400 hover:text-accent-600 mt-4"
        >
          Continue shopping
        </Link>
      </Card>
    </div>
  );
}

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

      <dd className="font-medium text-primary-900">
        ${Math.abs(value).toFixed(2)}
      </dd>
    </div>
  );
}