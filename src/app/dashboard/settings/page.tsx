import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth/session";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Extract strings to prevent Mongoose serialization errors
  const safeUser = {
    fullName: String(user.fullName || ""),
    email: String(user.email || ""),
    phone: String((user as unknown as { phone?: unknown }).phone || ""),
    business: String((user as unknown as { businessName?: unknown }).businessName || ""),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary-900">
          Account Settings
        </h1>
        <p className="text-primary-400 mt-1">
          Update your personal details and business information.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-primary-50 p-6">
        <SettingsForm user={safeUser} />
      </div>
    </div>
  );
}