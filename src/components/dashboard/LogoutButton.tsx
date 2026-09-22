"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
const handleLogout = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("LOGOUT_ERROR:", result.message);
        setLoading(false);
        return;
      }

      // -----------------------------------
      // Clear all local storage items
      // -----------------------------------
      localStorage.removeItem("cart-token");
      localStorage.removeItem("wc-nonce");
      localStorage.removeItem("token");
      localStorage.removeItem("planBannerDate");
      localStorage.removeItem("registerData");

      // Redirect to the login page and force a full page reload
      window.location.href = "/login";

    } catch (error) {
      console.error("Logout request failed:", error);
      setLoading(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-2 text-sm font-medium text-primary-400 hover:text-red-600 transition-colors disabled:opacity-60 ${className}`}
    >
      <LogOut size={16} />

      {loading ? "Signing out…" : "Log out"}
    </button>
  );
}