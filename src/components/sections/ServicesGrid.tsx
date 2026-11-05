import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PROMO_PRODUCTS } from "../../data/site";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

export function ServicesGrid() {
  return (
    <section className="section-py container-px">
      <SectionHeading eyebrow="Shop by Category" title="Promotional Products for Every Occasion" description="Build your brand presence with useful, custom-printed products for customers, teams, storefronts, and events." />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {PROMO_PRODUCTS.map((product, i) => (
          <Reveal delay={i * 0.06} key={product.slug}>
            <Link
              href={`/promotional-products/${product.slug}`}
              className="group block h-full rounded-2xl border border-primary-50 bg-white p-7 shadow-card hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-50 text-accent-600">
                  <product.icon size={22} />
                </span>
                <ArrowUpRight className="text-primary-100 group-hover:text-accent-600 transition-colors" size={20} />
              </div>
              <h3 className="mt-5 font-display font-semibold text-lg">{product.title}</h3>
              <p className="mt-2 text-sm text-primary-400 leading-relaxed">{product.description}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
