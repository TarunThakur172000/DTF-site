import type { ReactNode } from "react";
import { Eyebrow } from "../ui/Eyebrow";

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-surfaceMuted min-h-[calc(100vh-5rem)] flex items-center">
      <div className="container-px w-full py-16">
        <div className="mx-auto max-w-md rounded-3xl bg-white border border-primary-50 shadow-card p-8 md:p-10">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-primary-400">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
