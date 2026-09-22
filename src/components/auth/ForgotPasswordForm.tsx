"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/Button";

interface EmailValues {
  email: string;
}

interface ResetValues {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export function ForgotPasswordForm() {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "reset">(
    "email"
  );

  const [email, setEmail] = useState("");
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // -----------------------------------
  // Email form
  // -----------------------------------

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: {
      errors: emailErrors,
      isSubmitting: isSendingCode,
    },
  } = useForm<EmailValues>();

  // -----------------------------------
  // Reset form
  // -----------------------------------

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    watch,
    formState: {
      errors: resetErrors,
      isSubmitting: isResetting,
    },
  } = useForm<ResetValues>();

  const newPassword = watch("newPassword");

  // -----------------------------------
  // Send OTP
  // -----------------------------------

  const onSendCode = async (data: EmailValues) => {
    try {
      setServerError("");
      setSuccessMessage("");

      const normalizedEmail = data.email
        .trim()
        .toLowerCase();

      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type");

      let result;

      if (contentType?.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "FORGOT_PASSWORD_NON_JSON_RESPONSE:",
          text
        );

        setServerError(
          "Server error. Please try again."
        );

        return;
      }

      if (!response.ok) {
        setServerError(
          result.message ||
            "Unable to send reset code."
        );

        return;
      }

      setEmail(normalizedEmail);

      setSuccessMessage(
        result.message ||
          "If an account exists with this email, a reset code has been sent."
      );

      setStep("reset");
    } catch (error) {
      console.error(
        "FORGOT_PASSWORD_ERROR:",
        error
      );

      setServerError(
        "Something went wrong. Please try again."
      );
    }
  };

  // -----------------------------------
  // Reset password
  // -----------------------------------

  const onResetPassword = async (
    data: ResetValues
  ) => {
    try {
      setServerError("");
      setSuccessMessage("");

      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp: data.otp,
            newPassword: data.newPassword,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type");

      let result;

      if (contentType?.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "RESET_PASSWORD_NON_JSON_RESPONSE:",
          text
        );

        setServerError(
          "Server error. Please try again."
        );

        return;
      }

      if (!response.ok) {
        setServerError(
          result.message ||
            "Unable to reset password."
        );

        return;
      }

      setSuccessMessage(
        "Password reset successfully. Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      console.error(
        "RESET_PASSWORD_ERROR:",
        error
      );

      setServerError(
        "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* -------------------------------- */}
      {/* STEP 1 — EMAIL */}
      {/* -------------------------------- */}

      {step === "email" && (
        <form
          onSubmit={handleEmailSubmit(onSendCode)}
          noValidate
          className="space-y-5"
        >
          <div>
            <h2 className="text-xl font-bold text-primary-900">
              Forgot your password?
            </h2>

            <p className="mt-1 text-sm text-primary-400">
              Enter your email and we&apos;ll send
              you a password reset code.
            </p>
          </div>

          <Field
            label="Email"
            error={emailErrors.email?.message}
          >
            <input
              type="email"
              className="form-input"
              autoComplete="email"
              {...registerEmail("email", {
                required: "Email is required",
                pattern: {
                  value:
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message:
                    "Please enter a valid email address.",
                },
              })}
            />
          </Field>

          {serverError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSendingCode}
          >
            {isSendingCode
              ? "Sending code..."
              : "Send Reset Code"}
          </Button>

          <p className="text-center text-sm text-primary-400">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-accent-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      )}

      {/* -------------------------------- */}
      {/* STEP 2 — OTP + PASSWORD */}
      {/* -------------------------------- */}

      {step === "reset" && (
        <form
          onSubmit={handleResetSubmit(
            onResetPassword
          )}
          noValidate
          className="space-y-5"
        >
          <div>
            <h2 className="text-xl font-bold text-primary-900">
              Reset your password
            </h2>

            <p className="mt-1 text-sm text-primary-400">
              Enter the code sent to{" "}
              <span className="font-semibold text-primary-900">
                {email}
              </span>
            </p>
          </div>

          <Field
            label="Verification Code"
            error={resetErrors.otp?.message}
          >
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              className="form-input text-center tracking-[0.5em]"
              {...registerReset("otp", {
                required:
                  "Verification code is required",
                pattern: {
                  value: /^\d{6}$/,
                  message:
                    "Code must be 6 digits.",
                },
              })}
            />
          </Field>

          <Field
            label="New Password"
            error={
              resetErrors.newPassword?.message
            }
          >
            <input
              type="password"
              className="form-input"
              autoComplete="new-password"
              {...registerReset("newPassword", {
                required:
                  "New password is required",
                minLength: {
                  value: 8,
                  message:
                    "Password must be at least 8 characters.",
                },
              })}
            />
          </Field>

          <Field
            label="Confirm Password"
            error={
              resetErrors.confirmPassword?.message
            }
          >
            <input
              type="password"
              className="form-input"
              autoComplete="new-password"
              {...registerReset(
                "confirmPassword",
                {
                  required:
                    "Please confirm your password",
                  validate: (value) =>
                    value === newPassword ||
                    "Passwords do not match.",
                }
              )}
            />
          </Field>

          {serverError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isResetting}
          >
            {isResetting
              ? "Resetting password..."
              : "Reset Password"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setStep("email");
              setServerError("");
              setSuccessMessage("");
            }}
            className="w-full text-center text-sm font-semibold text-accent-600 hover:underline"
          >
            Use a different email
          </button>
        </form>
      )}
    </div>
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