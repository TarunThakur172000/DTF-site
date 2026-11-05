"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { ART_SERVICES } from "../../data/site";
import { FileUpload } from "./FileUpload";
import { Button } from "../ui/Button";

interface ArtZoneValues {
  name: string;
  business: string;
  email: string;
  phone: string;
  service: string;
  description: string;
  priority: "standard" | "rush";
}

export function ArtZoneForm() {
  const [artwork, setArtwork] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ArtZoneValues>({
    defaultValues: { service: ART_SERVICES[0].value, priority: "standard" },
  });

  const onSubmit = async (values: ArtZoneValues) => {
    setSubmitError("");

    try {
      const serviceLabel =
        ART_SERVICES.find((service) => service.value === values.service)?.label ??
        values.service;
      const formData = new FormData();
      formData.set("name", values.name);
      formData.set("business", values.business);
      formData.set("email", values.email);
      formData.set("phone", values.phone);
      formData.set("quantity", "1 artwork");
      formData.set("productType", `Art Zone — ${serviceLabel}`);
      formData.set(
        "notes",
        `Priority: ${values.priority}\n\n${values.description}`
      );
      artwork.forEach((file) => formData.append("artwork", file, file.name));

      const response = await fetch("/api/quote", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit your artwork request.");
      }

      setSubmitted(true);
      reset({ service: ART_SERVICES[0].value, priority: "standard" });
      setArtwork([]);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to submit your artwork request."
      );
    }
  };

  if (submitted) {
    return (
      <div className="mt-8 rounded-2xl border border-success-50 bg-success-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-success-600" size={36} />
        <h3 className="text-lg font-bold">Artwork request received</h3>
        <p className="mt-2 text-primary-400">
          Our team will review your files and follow up about your project.
        </p>
        <Button
          variant="secondary"
          className="mt-5"
          onClick={() => setSubmitted(false)}
        >
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mt-8 space-y-5 rounded-2xl border border-primary-50 bg-white p-6 shadow-card md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={errors.name?.message}>
          <input
            className="form-input"
            maxLength={120}
            {...register("name", { required: "Your name is required" })}
          />
        </Field>
        <Field label="Business (optional)">
          <input className="form-input" maxLength={120} {...register("business")} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            className="form-input"
            maxLength={254}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
            })}
          />
        </Field>
        <Field label="Phone (optional)">
          <input className="form-input" maxLength={50} {...register("phone")} />
        </Field>
      </div>

      <Field label="Artwork service">
        <select className="form-input" {...register("service")}>
          {ART_SERVICES.map((service) => (
            <option key={service.value} value={service.value}>
              {service.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Project details" error={errors.description?.message}>
        <textarea
          rows={4}
          className="form-input resize-none"
          maxLength={4500}
          placeholder="Describe what you need and which promotional product the artwork is for."
          {...register("description", {
            required: "Please describe your artwork request",
          })}
        />
      </Field>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-primary-900">
          Priority
        </legend>
        <div className="flex gap-3">
          {(["standard", "rush"] as const).map((priority) => (
            <label
              key={priority}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-primary-100 px-4 py-2 text-sm has-[:checked]:border-accent-600 has-[:checked]:bg-accent-50"
            >
              <input
                type="radio"
                value={priority}
                {...register("priority")}
                className="accent-accent-600"
              />
              <span className="capitalize">{priority}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <span className="text-sm font-semibold text-primary-900">Artwork files</span>
        <div className="mt-1.5">
          <FileUpload
            onFilesChange={setArtwork}
            helpText="AI, EPS, SVG, PDF, PNG, or JPG; up to 3 files and 10 MB total"
          />
        </div>
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit Artwork Request"}
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
