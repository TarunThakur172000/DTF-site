"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Check, Upload } from "lucide-react";

type AddToCartProps = {
  productId: number;
};

const WIDTH_OPTIONS = Array.from({ length: 120 }, (_, i) => `${i + 1}"`);
const HEIGHT_OPTIONS = Array.from({ length: 120 }, (_, i) => `${i + 1}"`);

export function AddToCart({ productId }: AddToCartProps) {
  const [width, setWidth] = useState('12"');
  const [height, setHeight] = useState('24"');
  const [quantity, setQuantity] = useState(1);
  const [additionalService, setAdditionalService] = useState("None");
  const [jobName, setJobName] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleAddToCart(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!jobName.trim()) {
      setError("Please enter a Job Name.");
      return;
    }

    if (!file) {
      setError("Please upload a design file (PNG, EPS, AI).");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("productId", String(productId));
      formData.append("quantity", String(quantity));
      formData.append("width", width);
      formData.append("height", height);
      formData.append("jobName", jobName.trim());
      formData.append("additionalService", additionalService);
      formData.append("orderNotes", orderNotes.trim());
      formData.append("file", file);

      const response = await fetch("/api/cart", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to add product to cart."
        );
      }

      setMessage("Added to cart successfully!");

      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("Add to cart error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to add product to cart."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleAddToCart} className="space-y-6">
      {/* Width & Height */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-2">
            Width (In) *
          </label>

          <select
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="w-full rounded-xl border border-primary-100 bg-white px-3 py-2.5 text-sm text-primary-900 focus:border-accent-600 focus:outline-none"
          >
            {WIDTH_OPTIONS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary-900 mb-2">
            Height (In) *
          </label>

          <select
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full rounded-xl border border-primary-100 bg-white px-3 py-2.5 text-sm text-primary-900 focus:border-accent-600 focus:outline-none"
          >
            {HEIGHT_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-semibold text-primary-900 mb-2">
          Quantity *
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setQuantity((prev) => Math.max(1, prev - 1))
            }
            disabled={quantity <= 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-primary-100 hover:border-accent-600 disabled:opacity-40"
          >
            <Minus size={16} />
          </button>

          <span className="w-8 text-center font-semibold text-lg">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              setQuantity((prev) => prev + 1)
            }
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-primary-100 hover:border-accent-600"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Additional Services */}
      <div>
        <label className="block text-sm font-semibold text-primary-900 mb-2">
          Additional Services
        </label>

        <select
          value={additionalService}
          onChange={(e) =>
            setAdditionalService(e.target.value)
          }
          className="w-full rounded-xl border border-primary-100 bg-white px-3 py-2.5 text-sm text-primary-900 focus:border-accent-600 focus:outline-none"
        >
          <option value="None">None</option>
          <option value="Remove White Background (+$10.00)">
            Remove White Background (+$10.00)
          </option>
          <option value="Remove Black Background (+$10.00)">
            Remove Black Background (+$10.00)
          </option>
        </select>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-semibold text-primary-900 mb-2">
          Upload File *{" "}
          <span className="text-xs font-normal text-primary-400">
            (PNG, EPS, AI)
          </span>
        </label>

        <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary-200 rounded-2xl p-6 text-center hover:border-accent-600 transition bg-surfaceMuted">
          <Upload
            className="text-primary-400 mb-2"
            size={28}
          />

          <input
            type="file"
            accept=".png,.eps,.ai"
            onChange={(e) =>
              setFile(e.target.files?.[0] || null)
            }
            className="block w-full text-sm text-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-accent-600 file:text-white hover:file:opacity-90 cursor-pointer"
          />

          {file && (
            <p className="mt-2 text-xs text-green-600 font-medium">
              Selected: {file.name}
            </p>
          )}
        </div>
      </div>

      {/* Job Name */}
      <div>
        <label className="block text-sm font-semibold text-primary-900 mb-2">
          Job Name *
        </label>

        <input
          type="text"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          placeholder="e.g. Summer T-Shirt Gang Sheet"
          required
          className="w-full rounded-xl border border-primary-100 bg-white px-3 py-2.5 text-sm text-primary-900 focus:border-accent-600 focus:outline-none"
        />
      </div>

      {/* Order Notes */}
      <div>
        <label className="block text-sm font-semibold text-primary-900 mb-2">
          Order Notes{" "}
          <span className="text-xs font-normal text-primary-400">
            (Optional)
          </span>
        </label>

        <textarea
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          placeholder="Any specific instructions..."
          rows={3}
          className="w-full rounded-xl border border-primary-100 bg-white px-3 py-2.5 text-sm text-primary-900 focus:border-accent-600 focus:outline-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-5 py-3.5 font-semibold text-white transition hover:opacity-90 disabled:opacity-50 shadow-lg shadow-accent-600/20"
      >
        {message ? (
          <>
            <Check size={18} />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart size={18} />
            {loading ? "Adding to Cart..." : "Add to Cart"}
          </>
        )}
      </button>

      {message && (
        <p className="text-center text-sm text-green-600 font-medium">
          {message}
        </p>
      )}

      {error && (
        <p className="text-center text-sm text-red-600 font-medium">
          {error}
        </p>
      )}
    </form>
  );
}