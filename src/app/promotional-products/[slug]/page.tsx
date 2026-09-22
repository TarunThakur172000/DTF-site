import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHero } from "../../../components/sections/PageHero";
import { PROMO_PRODUCTS, FAQ_GENERAL } from "../../../data/site";
import { Reveal } from "../../../components/ui/Reveal";
import { FaqAccordion } from "../../../components/ui/FaqAccordion";
import { QuoteForm } from "../../../components/forms/QuoteForm";
import { CtaBanner } from "../../../components/sections/CtaBanner";

export function generateStaticParams() {
  return PROMO_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = PROMO_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return {};
  return {
    title: `${product.title} — Promotional Products`,
    description: product.description,
    alternates: { canonical: `/promotional-products/${product.slug}` },
  };
}

export default async function PromoDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = PROMO_PRODUCTS.find((p) => p.slug === slug);

  if (!product) redirect("/promotional-products");

  return (
    <>
      <PageHero
        eyebrow="Promotional Products"
        title={product.title}
        description={product.description}
        crumbs={[{ label: "Promotional Products", to: "/promotional-products" }, { label: product.title }]}
      />

      <section className="section-py container-px grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <Reveal>
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover rounded-2xl shadow-card"
            />
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-8">
            <Reveal>
              <h2 className="text-xl font-display font-bold mb-4">{product.slug === "stickers" ? "Available shapes" : "Available sizes"}</h2>
              <ul className="space-y-2">
                {product.sizes.map((s) => (
                  <li key={s} className="rounded-xl border border-primary-50 bg-white px-4 py-2.5 text-sm">{s}</li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="text-xl font-display font-bold mb-4">Materials</h2>
              <ul className="space-y-2">
                {product.materials.map((m) => (
                  <li key={m} className="rounded-xl border border-primary-50 bg-white px-4 py-2.5 text-sm">{m}</li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal>
            <h2 className="text-xl font-display font-bold mb-4">Features</h2>
            <ul className="flex flex-wrap gap-2">
              {product.features.map((f) => (
                <li key={f} className="rounded-full bg-accent-50 text-accent-600 text-sm font-medium px-4 py-1.5">{f}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-display font-bold mb-5">FAQ</h2>
            <FaqAccordion items={FAQ_GENERAL} />
          </Reveal>

          <Link href="/promotional-products" className="inline-block text-sm font-semibold text-accent-600 hover:underline">
            ← Back to promotional products
          </Link>
        </div>

        <Reveal className="lg:col-span-1">
          <div className="rounded-2xl border border-primary-50 bg-white p-6 shadow-card sticky top-28">
            <h3 className="font-display font-semibold text-lg mb-1">Get a quote</h3>
            <p className="text-sm text-primary-400 mb-5">Send us your quantity and artwork to get pricing.</p>
            <QuoteForm productType={product.title} />
          </div>
        </Reveal>
      </section>

      <CtaBanner />
    </>
  );
}
