import type { Metadata } from "next";
import { PageHero } from "../../components/sections/PageHero";
import { APPAREL_CATEGORIES } from "../../data/site";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { Reveal } from "../../components/ui/Reveal";
import { QuoteForm } from "../../components/forms/QuoteForm";
import { CtaBanner } from "../../components/sections/CtaBanner";

export const metadata: Metadata = {
  title: "Custom Apparel — T-Shirts, Hoodies, Hats, Polos & Sweatshirts",
  description: "Order custom apparel including t-shirts, hoodies, hats, polo shirts and sweatshirts printed or embroidered with your artwork.",
  alternates: { canonical: "/custom-apparel" },
};

export default function CustomApparel() {
  return (
    <>
      <PageHero
        eyebrow="Custom Apparel"
        title="Apparel that actually fits the brief"
        description="Upload your artwork, tell us the garment and quantity, and we'll handle the rest — printed or embroidered, one piece or one thousand."
        crumbs={[{ label: "Custom Apparel" }]}
      />

      <section className="section-py container-px">
        <SectionHeading eyebrow="Categories" title="Shop apparel by category" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {APPAREL_CATEGORIES.map((cat, i) => (
            <Reveal delay={i * 0.05} key={cat.title}>
              <div className="group rounded-2xl overflow-hidden shadow-card border border-primary-50 bg-white">
                <div className="overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    loading="lazy"
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="p-4 text-center font-semibold text-sm">{cat.title}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-py bg-surfaceMuted">
        <div className="container-px max-w-2xl mx-auto">
          <SectionHeading eyebrow="Get started" title="Request custom apparel" align="center" description="Fill out the details below and our team will follow up with pricing and mockups." />
          <div className="mt-10 rounded-2xl border border-primary-50 bg-white p-6 md:p-8 shadow-card">
            <QuoteForm productType="Custom Apparel" />
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
