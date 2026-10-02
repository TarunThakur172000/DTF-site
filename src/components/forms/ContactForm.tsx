"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";

interface ContactValues {
  name: string;
  email: string;
  message: string;
}

export function ContactForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactValues>();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const onSubmit = async (values: ContactValues) => {
    setSubmitError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to send your message.");
      }

      setSubmitted(true);
      reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to send your message."
      );
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-success-50 bg-success-50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-success-600" size={36} />
        <h3 className="text-lg font-bold">Message sent</h3>
        <p className="text-primary-400 mt-2">We&apos;ll get back to you within one business day.</p>
        <Button variant="secondary" className="mt-5" onClick={() => setSubmitted(false)}>Send another message</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 rounded-2xl border border-primary-50 bg-white p-6 md:p-8 shadow-card">
      <label className="block">
        <span className="text-sm font-semibold text-primary-900">Full name</span>
        <input className="form-input mt-1.5" {...register("name", { required: "Your name is required" })} />
        {errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name.message}</span>}
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-primary-900">Email</span>
        <input type="email" className="form-input mt-1.5" {...register("email", {
          required: "Email is required",
          pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
        })} />
        {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email.message}</span>}
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-primary-900">Message</span>
        <textarea rows={5} className="form-input mt-1.5 resize-none" {...register("message", { required: "Tell us a bit about your project" })} />
        {errors.message && <span className="mt-1 block text-xs text-red-600">{errors.message.message}</span>}
      </label>
      {submitError && <p role="alert" className="text-sm text-red-600">{submitError}</p>}
      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
