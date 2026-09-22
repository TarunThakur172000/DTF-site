"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { ART_SERVICES } from "../../data/site";
import { FileUpload } from "./FileUpload";
import { Button } from "../ui/Button";

interface ArtZoneValues {
  service: string;
  description: string;
  priority: string;
}

export function ArtZoneForm() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ArtZoneValues>({
    defaultValues: { service: ART_SERVICES[0].value, priority: "standard" },
  });
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 900));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-success-50 bg-success-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-success-600" size={36} />
        <h3 className="text-lg font-bold">Artwork submitted</h3>
        <p className="text-primary-400 mt-2">
          Our art team will review your files and update the status of your request below.
        </p>
        <Button variant="secondary" className="mt-5" onClick={() => setSubmitted(false)}>
          Submit another file
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-2xl border border-primary-50 bg-white p-6 md:p-8 shadow-card">
      <div>
        <span className="text-sm font-semibold text-primary-900">Upload artwork, logos or images</span>
        <div className="mt-2">
          <FileUpload />
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-primary-900">Choose a service</span>
        <select className="form-input mt-1.5" {...register("service")}>
          {ART_SERVICES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-primary-900">Description</span>
        <textarea rows={4} className="form-input mt-1.5 resize-none" placeholder="Tell us what you need done to this file…" {...register("description")} />
      </label>

      <fieldset>
        <legend className="text-sm font-semibold text-primary-900 mb-2">Priority</legend>
        <div className="flex gap-3">
          {["standard", "rush"].map((val) => (
            <label key={val} className="flex items-center gap-2 rounded-xl border border-primary-100 px-4 py-2 text-sm cursor-pointer has-[:checked]:border-accent-600 has-[:checked]:bg-accent-50">
              <input type="radio" value={val} {...register("priority")} className="accent-accent-600" />
              <span className="capitalize">{val}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit"}
      </Button>
    </form>
  );
}
