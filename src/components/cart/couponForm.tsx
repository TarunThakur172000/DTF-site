"use client";

import { useState } from "react";

type CouponProps = {
  onApplied?: () => void;
};

export function CouponForm({ onApplied }: CouponProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function applyCoupon() {
    if (!code.trim()) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to apply coupon"
        );
      }

      setSuccess("Coupon applied successfully");
      setCode("");

      onApplied?.();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to apply coupon"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-primary-900">
        Have a coupon?
      </h3>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Coupon code"
          className="flex-1 rounded-lg border border-primary-100 px-3 py-2 text-sm outline-none focus:border-accent-600"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              applyCoupon();
            }
          }}
        />

        <button
          type="button"
          onClick={applyCoupon}
          disabled={loading || !code.trim()}
          className="rounded-lg bg-primary-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Applying..." : "Apply"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-2 text-sm text-green-600">
          {success}
        </p>
      )}
    </div>
  );
}