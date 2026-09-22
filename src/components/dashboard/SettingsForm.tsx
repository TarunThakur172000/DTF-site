"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { Button } from "../ui/Button";

interface SettingsValues {
  name: string;
  business: string;
  email: string;
  phone: string;
}

// 1. Accept the user data as a prop
export function SettingsForm({ user }: { user: any }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SettingsValues>({
    // 2. Set the default values dynamically from the DB
    defaultValues: {
      name: user?.fullName || "",
      email: user?.email || "",
      business: user?.business || "",
      phone: user?.phone || "",
    },
  });
  

  const onSubmit = async (data: SettingsValues) => {
    setError("");
    console.log("Submitting data:", data); // Debugging line
    try {
      // 3. Make the real API call to update the database
      const response = await fetch("/api/account/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save settings");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      
      // Optional: force a router refresh to update the sidebar name if it changed
      // window.location.reload(); 
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Full name">
          <input className="form-input" {...register("name")} />
        </Field>
        <Field label="Business">
          <input className="form-input" {...register("business")} />
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Email (Read Only)">
          {/* Usually best to make email read-only unless you have an email verification flow */}
          <input type="email" className="form-input bg-gray-50 cursor-not-allowed" readOnly {...register("email")} />
        </Field>
        <Field label="Phone">
          <input className="form-input" {...register("phone")} />
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save Changes"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-success-600">
            <CheckCircle2 size={16} /> Saved
          </span>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-primary-900">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}