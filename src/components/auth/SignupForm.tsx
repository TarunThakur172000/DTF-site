"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";

import { Button } from "../ui/Button";

interface SignupValues {
  name: string;
  business?: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

interface VerifyResponse {
  success: boolean;
  message: string;
}

export function SignupForm() {
  const [showVerification, setShowVerification] =
    useState(false);

  const [verificationEmail, setVerificationEmail] =
    useState("");

  const [otp, setOtp] = useState("");

  const [verificationLoading, setVerificationLoading] =
    useState(false);

  const [verificationError, setVerificationError] =
    useState("");

  const [verificationSuccess, setVerificationSuccess] =
    useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>();

  const onSubmit = async (data: SignupValues) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: data.name,
          businessName: data.business || "",
          email: data.email,
          password: data.password,
        }),
      });

      const result: RegisterResponse =
        await response.json();

      if (!response.ok || !result.success) {
        setError("root", {
          type: "server",
          message:
            result.message ||
            "Unable to create your account.",
        });

        return;
      }

      // Store email for verification
      setVerificationEmail(data.email);

      // Clear previous verification state
      setOtp("");
      setVerificationError("");
      setVerificationSuccess("");

      // Open verification popup
      setShowVerification(true);
    } catch (error) {
      console.error("SIGNUP_ERROR:", error);

      setError("root", {
        type: "server",
        message:
          "Something went wrong. Please try again.",
      });
    }
  };

  const handleVerifyEmail = async () => {
    setVerificationError("");
    setVerificationSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setVerificationError(
        "Please enter a valid 6-digit code."
      );
      return;
    }

    setVerificationLoading(true);

    try {
      const response = await fetch(
        "/api/auth/verify-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: verificationEmail,
            otp,
          }),
        }
      );

      const result: VerifyResponse =
        await response.json();

      if (!response.ok || !result.success) {
        setVerificationError(
          result.message ||
            "Email verification failed."
        );

        return;
      }

      setVerificationSuccess(
        "Email verified successfully!"
      );

      /*
       * Later we can automatically log the user in
       * here and redirect them to the dashboard.
       */

      setTimeout(() => {
        setShowVerification(false);
      }, 1200);
    } catch (error) {
      console.error(
        "VERIFY_EMAIL_ERROR:",
        error
      );

      setVerificationError(
        "Something went wrong. Please try again."
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5"
      >
        {/* Full Name */}
        <Field
          label="Full name"
          error={errors.name?.message}
        >
          <input
            className="form-input"
            autoComplete="name"
            {...register("name", {
              required: "Your name is required",
              minLength: {
                value: 2,
                message:
                  "Name must be at least 2 characters",
              },
            })}
          />
        </Field>

        {/* Business */}
        <Field label="Business (optional)">
          <input
            className="form-input"
            autoComplete="organization"
            {...register("business")}
          />
        </Field>

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
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Enter a valid email",
              },
            })}
          />
        </Field>

        {/* Password */}
        <Field
          label="Password"
          error={errors.password?.message}
        >
          <input
            type="password"
            className="form-input"
            autoComplete="new-password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message:
                  "Use at least 8 characters",
              },
            })}
          />
        </Field>

        {/* Server Error */}
        {errors.root?.message && (
          <p className="text-sm text-red-600">
            {errors.root.message}
          </p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Creating account…"
            : "Create Account"}
        </Button>

        {/* Login */}
        <p className="text-center text-sm text-primary-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-accent-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>

      {/* Verification Popup */}
      {showVerification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowVerification(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-title"
          >
            {/* Header */}
            <div className="text-center">
              <h2
                id="verification-title"
                className="text-2xl font-bold text-primary-900"
              >
                Verify your email
              </h2>

              <p className="mt-2 text-sm text-primary-500">
                We sent a 6-digit verification code to
              </p>

              <p className="mt-1 font-semibold text-primary-900">
                {verificationEmail}
              </p>
            </div>

            {/* OTP */}
            <div className="mt-6">
              <label
                htmlFor="verification-code"
                className="block text-sm font-semibold text-primary-900"
              >
                Verification code
              </label>

              <input
                id="verification-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                value={otp}
                onChange={(e) => {
                  setOtp(
                    e.target.value.replace(/\D/g, "")
                  );
                  setVerificationError("");
                }}
                className="form-input mt-2 w-full text-center text-2xl tracking-[0.5em]"
                placeholder="000000"
              />
            </div>

            {/* Error */}
            {verificationError && (
              <p className="mt-3 text-sm text-red-600">
                {verificationError}
              </p>
            )}

            {/* Success */}
            {verificationSuccess && (
              <p className="mt-3 text-sm text-green-600">
                {verificationSuccess}
              </p>
            )}

            {/* Verify button */}
            <Button
              type="button"
              size="lg"
              className="mt-6 w-full"
              disabled={
                verificationLoading ||
                otp.length !== 6
              }
              onClick={handleVerifyEmail}
            >
              {verificationLoading
                ? "Verifying..."
                : "Verify Email"}
            </Button>

            {/* Close */}
            <button
              type="button"
              onClick={() =>
                setShowVerification(false)
              }
              className="mt-3 w-full text-sm font-medium text-primary-500 hover:text-primary-900"
            >
              Cancel
            </button>

            <p className="mt-4 text-center text-xs text-primary-400">
              The verification code expires in 10
              minutes.
            </p>
          </div>
        </div>
      )}
    </>
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