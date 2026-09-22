import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PageHero } from "../../components/sections/PageHero";
import { FAQ_GENERAL } from "../../data/site";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { Reveal } from "../../components/ui/Reveal";
import { FaqAccordion } from "../../components/ui/FaqAccordion";
import { CtaBanner } from "../../components/sections/CtaBanner";

import { wooCommerceRequest } from "@/lib/server/woocommerce/client";

export const metadata: Metadata = {
  title: "Transfer Printing — DTF, UV DTF, Glitter DTF & Sublimation",
  description:
    "Custom transfer printing services including DTF, UV DTF, glitter DTF and sublimation for apparel and hard surfaces.",
  alternates: {
    canonical: "/transfer-printing",
  },
};

type WooProduct = {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  images: {
    id: number;
    src: string;
    thumbnail: string;
    alt: string;
  }[];
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
};

type WooCategory = {
  id: number;
  name: string;
  slug: string;
};

async function getProductsByCategories(): Promise<
  { category: WooCategory; products: WooProduct[] }[]
> {
  const categories = await wooCommerceRequest<WooCategory[]>(
    "/products/categories?per_page=100"
  );

  const result = await Promise.all(
    categories.map(async (category) => {
      const products = await wooCommerceRequest<WooProduct[]>(
        `/products?category=${category.id}&per_page=100`
      );

      return {
        category,
        products,
      };
    })
  );

  return result;
}

export default async function TransferPrinting() {
  const categoryProducts = await getProductsByCategories();

  return (
    <>
      <PageHero
        eyebrow="Transfer Printing"
        title="Press Once. Made to Last."
        description="High-performance Direct-to-Film (DTF) and Sublimation transfer printing designed for exceptional colour, durability, and precision. From apparel and textiles to mugs, signage, and promotional products, our transfer solutions deliver vibrant, long-lasting results across a wide range of materials.

Choose a printing method below to explore its features, ideal applications, technical specifications, and pricing."
        crumbs={[
          {
            label: "Transfer Printing",
          },
        ]}
      />

      <section className="section-py container-px">
        <SectionHeading
          eyebrow="Transfer Printing"
          title="Pick your transfer method"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {categoryProducts.flatMap(({ products }) =>
            products.map((product, i) => {
              const image = product.images?.[0];

            return (
              <Reveal
                delay={i * 0.06}
                key={product.id}
              >
                <Link
                  href={`/transfer-printing/${product.slug}`}
                  className="group block h-full rounded-2xl border border-primary-50 bg-white p-8 shadow-card hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-50 text-accent-600 overflow-hidden">
                      {image ? (
                        <img
                          src={image.thumbnail || image.src}
                          alt={image.alt || product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs">
                          No image
                        </span>
                      )}
                    </span>

                    <ArrowUpRight
                      className="text-primary-100 group-hover:text-accent-600 transition-colors"
                      size={20}
                    />
                  </div>

                  <h3 className="mt-5 font-display font-semibold text-xl">
                    {product.name}
                  </h3>

                  {product.short_description && (
                    <div
                      className="mt-3 text-primary-400 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html:
                          product.short_description,
                      }}
                    />
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {product.categories?.map(
                      (category) => (
                        <span
                          key={category.id}
                          className="text-xs rounded-full bg-surfaceMuted px-3 py-1 text-primary-400"
                        >
                          {category.name}
                        </span>
                      )
                    )}
                  </div>

                  <p className="mt-5 font-semibold text-primary-900">
                    {product.price
                      ? `From $${product.price}`
                      : "Request a quote"}
                  </p>
                </Link>
              </Reveal>
            );
          }))}
        </div>

        {categoryProducts.some(({ products }) => products.length > 0) === false && (
          
          <div className="mt-12 text-center py-12">
            <p className="text-primary-400">
              No transfer printing products are
              currently available.
            </p>
          </div>
        )}
      </section>

      <section className="section-py bg-surfaceMuted">
        <div className="container-px max-w-3xl mx-auto">
          <SectionHeading
            eyebrow="Questions"
            title="Transfer printing FAQ"
            align="center"
          />

          <div className="mt-10">
            <FaqAccordion items={FAQ_GENERAL} />
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}