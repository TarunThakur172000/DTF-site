import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white border border-primary-50 shadow-card ${className}`}>
      {children}
    </div>
  );
}
