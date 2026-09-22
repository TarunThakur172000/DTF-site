import type { Metadata } from "next";
import { HowItWorks } from "../../components/dtf-guide/HowItWorks";

export const metadata: Metadata = {
  title: "How to Apply DTF Transfers",
  description: "A step-by-step application guide for pressing DTF transfers onto garments.",
  alternates: { canonical: "/instruction" },
};

export default function InstructionPage() {
  return <HowItWorks />;
}
