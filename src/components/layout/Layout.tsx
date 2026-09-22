import type { ReactNode } from "react";
import {Navbar} from "@/components/layout/Navbar";
import { Footer } from "./Footer";
import { FloatingQuoteButton } from "../ui/FloatingQuoteButton";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:bg-accent-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingQuoteButton />
    </div>
  );
}
