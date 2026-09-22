import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "../../components/dashboard/DashboardShell";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth/session";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Dashboard",
  },
  robots: { index: false, follow: false },
};


export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  const safeUser = {
    fullName: String(user.fullName || ""),
    email: String(user.email || "")
  };
  console.log("safeUser", safeUser);
  
  return <DashboardShell user={safeUser}>{children}</DashboardShell>;
}



