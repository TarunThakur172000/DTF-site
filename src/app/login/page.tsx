import type { Metadata } from "next";
import { AuthCard } from "../../components/auth/AuthCard";
import { LoginForm } from "../../components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthCard eyebrow="Welcome back" title="Sign in to your account" description="Access your orders, quotes, and account details.">
      <LoginForm />
    </AuthCard>
  );
}
