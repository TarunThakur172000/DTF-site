"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";
import { FileUpload } from "./FileUpload";

interface QuoteFormValues {
  name: string;
  business?: string;
  email: string;
  phone?: string;
  quantity: string;
  productType: string;
  size?: string;
  customSize?: string;
  shape?: string;
  customShape?: string;
  notes?: string;
}

interface QuoteFormProps {
  productType?: string;
  onSuccess?: () => void;
}

export function QuoteForm({ productType, onSuccess }: QuoteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<QuoteFormValues>({
    defaultValues: {
      productType: productType ?? "",
    },
  });

  const selectedProduct = watch("productType");

  const isBanner = selectedProduct.toLowerCase().includes("banner");
  const isMagnet = selectedProduct.toLowerCase().includes("magnets");

  const needsSize = isBanner || isMagnet;

  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 900));
    setSubmitted(true);
    reset();

    if (onSuccess) {
      onSuccess();
    }
  };

  const SIZE_OPTIONS = {
    banner: [
      "2' × 4'",
      "2' × 6'",
      "3' × 5'",
      "3' × 6'",
      "3' × 8'",
      "4' × 8'",
      "Custom Size",
    ],
    magnet: [
      '2" × 3"',
      '2" × 4"',
      '3" × 4"',
      '4" × 6"',
      '5" × 7"',
      "Custom Size",
    ],
  };

  const SHAPE_OPTIONS = [
    "Rectangle",
    "Square",
    "Circle",
    "Oval",
    "Rounded Corners",
    "Custom Shape",
  ];

  if (submitted) {
    return (
      <div className="rounded-2xl border border-success-50 bg-success-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-success-600" size={36} />
        <h3 className="text-lg font-bold">Request received</h3>
        <p className="text-primary-400 mt-2">
          A member of our team will follow up with your quote within one business day.
        </p>
        <Button variant="secondary" className="mt-5" onClick={() => setSubmitted(false)}>
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 m-[2rem]">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Full name" error={errors.name?.message}>
          <input
            className="form-input"
            {...register("name", { required: "Your name is required" })}
          />
        </Field>
        <Field label="Business (optional)">
          <input className="form-input" {...register("business")} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            className="form-input"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
            })}
          />
        </Field>
        <Field label="Phone (optional)">
          <input className="form-input" {...register("phone")} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Quantity" error={errors.quantity?.message}>
          <input
            className="form-input"
            placeholder="e.g. 100"
            {...register("quantity", { required: "Let us know an estimated quantity" })}
          />
        </Field>
        <Field label="Product type" error={errors.productType?.message}>
          <input className="form-input" {...register("productType", { required: "Tell us what you need" })} />
        </Field>
      </div>

      {needsSize && (
        <Field label="Size" error={errors.size?.message}>
          <select
            className="form-input"
            {...register("size", {
              required: "Please select a size",
            })}
          >
            <option value="">Select a size</option>

            {(isBanner ? SIZE_OPTIONS.banner : SIZE_OPTIONS.magnet).map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </Field>
      )}

      {needsSize && watch("size") === "Custom Size" && (
        <Field label="Custom dimensions" error={errors.customSize?.message}>
          <input
            className="form-input"
            placeholder={
              isBanner
                ? "e.g. 5' × 10'"
                : 'e.g. 4" × 8"'
            }
            {...register("customSize", {
              required: "Please enter your custom dimensions",
            })}
          />
        </Field>
      )}

      {isMagnet && (
        <Field label="Shape" error={errors.shape?.message}>
          <select
            className="form-input"
            {...register("shape", {
              required: "Please select a shape",
            })}
          >
            <option value="">Select a shape</option>

            {SHAPE_OPTIONS.map((shape) => (
              <option key={shape} value={shape}>
                {shape}
              </option>
            ))}
          </select>
        </Field>
      )}

      {isMagnet && watch("shape") === "Custom Shape" && (
        <Field label="Describe your shape" error={errors.customShape?.message}>
          <input
            className="form-input"
            placeholder="e.g. company logo shape"
            {...register("customShape", {
              required: "Please describe your custom shape",
            })}
          />
        </Field>
      )}
      <Field label="Artwork">
        <FileUpload />
      </Field>

      <Field label="Notes (optional)">
        <textarea rows={4} className="form-input resize-none" {...register("notes")} />
      </Field>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit Request"}
      </Button>
    </form>
  );
}

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
      <span className="text-sm font-semibold text-primary-900">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
