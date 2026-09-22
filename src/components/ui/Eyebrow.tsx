import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="eyebrow">
      <span className="reg-mark text-accent-600">
        <span className="reg-mark-circle" />
      </span>
      {children}
    </span>
  );
}
