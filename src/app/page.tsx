import type { Metadata } from "next";
import { Hero } from "../components/sections/Hero";
import { ServicesGrid } from "../components/sections/ServicesGrid";
import { WhyChooseUs } from "../components/sections/WhyChooseUs";
import { CtaBanner } from "../components/sections/CtaBanner";

export const metadata: Metadata = {
  title: "Custom Promotional Products for Your Business",
  description:
    "Create a lasting impression with custom business cards, stickers, banners, event tents, magnets, and flags.",
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
  