import type { Metadata } from "next";
import { AuthCard } from "../../components/auth/AuthCard";
import { SignupForm } from "../../components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthCard eyebrow="Get started" title="Create your account" description="Save your quotes, track orders, and check out faster.">
      <SignupForm />
    </AuthCard>
  );
}
