import type { Metadata } from "next";
import { Hero } from "../components/sections/Hero";
import { ServicesGrid } from "../components/sections/ServicesGrid";
import { WhyChooseUs } from "../components/sections/WhyChooseUs";
import { CtaBanner } from "../components/sections/CtaBanner";

export const metadata: Metadata = {
  title: "Custom Printing Made Easy",
  description:
    "PrintPressRepeat delivers custom DTF transfers, promotional products, apparel and team jerseys with fast turnaround and premium materials.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <WhyChooseUs />
      <CtaBanner />
    </>
  );
}
  