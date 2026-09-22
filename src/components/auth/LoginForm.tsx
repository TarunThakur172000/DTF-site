"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/Button";

interface LoginValues {
  email: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>();

const onSubmit = async (data: LoginValues) => {
    try {
      setServerError("");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      // -----------------------------------
      // Login failed
      // -----------------------------------

      if (!response.ok) {
        setServerError(
          result.message || "Unable to sign in."
        );

        return;
      }

        console.log("LOGIN_SUCCESS:", result);
      // -----------------------------------
      // Login successful
      // -----------------------------------

      // Save the WordPress JWT token if returned in the response payload
      if (result.token) {
        localStorage.setItem("cart-token", result.token); 
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("LOGIN_ERROR:", error);

      setServerError(
        "Something went wrong. Please try again."
      );
    }
  };   
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      {/* Email */}

      <Field
        label="Email"
        error={errors.email?.message}
      >
        <input
          type="email"
          className="form-input"
          autoComplete="email"
          {...register("email", {
            required: "Email is required",
          })}
        />
      </Field>

      {/* Password */}

      <Field
        label="Password"
        error={errors.password?.message}
      >
        <div className="relative">
          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            className="form-input pr-10"
            autoComplete="current-password"
            {...register("password", {
              required:
                "Password is required",
            })}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((v) => !v)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-900"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
          </button>
        </div>
      </Field>

      {/* Server error */}

      {serverError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {/* Remember / Forgot */}

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-primary-400">
          <input
            type="checkbox"
            className="rounded border-primary-100 text-accent-600 focus:ring-accent-100"
          />

          Remember me
        </label>

        <Link
          href="/forgot-password"
          className="font-semibold text-accent-600 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit */}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Signing in…"
          : "Sign In"}
      </Button>

      {/* Signup */}

      <p className="text-center text-sm text-primary-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-accent-600 hover:underline"
        >
          Create one
        </Link>
      </p>
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