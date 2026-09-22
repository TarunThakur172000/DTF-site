import type { Metadata } from "next";
import { Zap } from "lucide-react";
import { PageHero } from "../../components/sections/PageHero";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { Reveal } from "../../components/ui/Reveal";
import { Card } from "../../components/ui/Card";
import { CtaBanner } from "../../components/sections/CtaBanner";

const CATEGORIES = [
  { title: "Skateboards", description: "Custom printed decks, coming to the shop soon.", image: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800&q=80" },
  { title: "Seasonal Products", description: "Limited-run seasonal merchandise and packaging.", image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&q=80" },
  { title: "Holiday Gifts", description: "Branded gift sets and custom holiday cards.", image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&q=80" },
];

export const metadata: Metadata = {
  title: "Random Products — What's Coming Next",
  description: "A look at upcoming product categories from PrintCraft Co., including skateboards, seasonal products and holiday gifts.",
  alternates: { canonical: "/random-products" },
};

export default function RandomProducts() {
  return (
    <>
      <PageHero
        eyebrow="Coming Soon"
        title="What we're printing next"
        description="We're always testing new product categories. Here's a preview of what's headed to the shop."
        crumbs={[{ label: "Random Products" }]}
      />

      <section className="section-py container-px">
        <SectionHeading eyebrow="In development" title="Upcoming categories" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => (
            <Reveal delay={i * 0.05} key={cat.title}>
              <Card className="overflow-hidden relative">
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-full bg-primary-900/90 text-white text-xs font-semibold px-3 py-1">
                  <Zap size={12} /> Coming soon
                </div>
                <img src={cat.image} alt={cat.title} loading="lazy" className="w-full h-52 object-cover" />
                <div className="p-6">
                  <h3 className="font-display font-semibold text-lg">{cat.title}</h3>
                  <p className="mt-2 text-sm text-primary-400">{cat.description}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
