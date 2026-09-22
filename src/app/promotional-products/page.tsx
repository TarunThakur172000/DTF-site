//need to remove
export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "../../components/sections/PageHero";
import { PROMO_PRODUCTS } from "../../data/site";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { Reveal } from "../../components/ui/Reveal";
import { Card } from "../../components/ui/Card";
import { CtaBanner } from "../../components/sections/CtaBanner";

export const metadata: Metadata = {
  title: "Promotional Products — Business Cards, Stickers, Banners & More",
  description: "Shop custom promotional products including business cards, stickers, banners, tents, magnets and flags.",
  alternates: { canonical: "/promotional-products" },
};

export default function PromotionalProducts() {
  return (
    <>
      <PageHero
        eyebrow="Promotional Products"
        title="Everything you hand out, wear or hang up"
        description="Business cards to trade show tents — every promotional product ships with a free digital proof and fast turnaround."
        crumbs={[{ label: "Promotional Products" }]}
      />

      <section className="section-py container-px">
        <SectionHeading eyebrow="Shop by product" title="Promotional product catalog" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROMO_PRODUCTS.map((product, i) => (
            <Reveal delay={i * 0.05} key={product.slug}>
              <Link href={`/promotional-products/${product.slug}`}>
                <Card className="overflow-hidden group h-full flex flex-col hover:shadow-lift hover:-translate-y-1 transition-all duration-300">
                  <div className="overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      loading="lazy"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-50 text-accent-600">
                        <product.icon size={18} />
                      </span>
                      <ArrowUpRight className="text-primary-100 group-hover:text-accent-600" size={18} />
                    </div>
                    <h3 className="mt-4 font-display font-semibold text-lg">{product.title}</h3>
                    <p className="mt-2 text-sm text-primary-400 flex-1">{product.description}</p>
                  </div>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
