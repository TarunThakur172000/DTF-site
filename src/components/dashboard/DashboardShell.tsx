"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { LayoutGrid, Package, FileText, Settings, ShoppingCart } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { MOCK_USER } from "../../data/mock-account";
import { getCurrentUser } from "@/lib/server/auth/session";
import { connectDB } from "@/lib/server/db";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Orders", href: "/dashboard/orders", icon: Package },
  { label: "Addresses", href: "/dashboard/addresses", icon: FileText },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

type DashboardShellProps = {
  children: ReactNode;
  user: {
    fullName: string;
    email: string;
  };
};

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();


  return (
    <div className="bg-surfaceMuted">
      <div className="container-px py-10 grid lg:grid-cols-[240px_1fr] gap-8 items-start">
        <aside className="lg:sticky lg:top-24 rounded-2xl bg-white border border-primary-50 shadow-card p-5">
          <div className="flex items-center gap-3 pb-4 border-b border-primary-50">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-50 text-accent-600 font-display font-bold">
              {user.fullName.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-primary-900 truncate">{user.fullName}</p>
              <p className="text-xs text-primary-400 truncate">{user.email}</p>
            </div>
          </div>

          <nav className="mt-4 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible" aria-label="Dashboard">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive ? "bg-accent-50 text-accent-600" : "text-primary-400 hover:bg-surfaceMuted hover:text-primary-900"
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/cart"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap text-primary-400 hover:bg-surfaceMuted hover:text-primary-900"
            >
              <ShoppingCart size={16} />
              Cart
            </Link>
          </nav>

          <div className="mt-4 pt-4 border-t border-primary-50">
            <LogoutButton className="px-3.5" />
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
