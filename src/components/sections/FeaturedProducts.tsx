import Link from "next/link";
import { FEATURED_PRODUCTS } from "../../data/site";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { Card } from "../ui/Card";

export function FeaturedProducts() {
  return (
    <section className="section-py container-px">
      <SectionHeading eyebrow="Popular Right Now" title="Featured Transfer Products" description="Our most-ordered transfers, trusted by print shops and brands for consistent quality." />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED_PRODUCTS.map((product, i) => (
          <Reveal delay={i * 0.06} key={product.slug}>
            <Card className="overflow-hidden h-full flex flex-col group">
              <div className="aspect-square overflow-hidden bg-surfaceMuted">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="text-xs font-semibold text-accent-600 uppercase tracking-wide">{product.category}</span>
                <h3 className="mt-1.5 font-display font-semibold">{product.title}</h3>
                <p className="mt-2 text-sm text-primary-400 flex-1">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary-900">{product.priceFrom}</span>
                  <Link href="/transfer-printing" className="text-sm font-semibold text-accent-600 hover:text-accent-700">
                    View
                  </Link>
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
