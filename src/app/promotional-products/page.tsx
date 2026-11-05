import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PageHero } from "../../components/sections/PageHero";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { Reveal } from "../../components/ui/Reveal";
import { Card } from "../../components/ui/Card";
import { CtaBanner } from "../../components/sections/CtaBanner";

import { wooCommerceRequest } from "@/lib/server/woocommerce/client";

export const metadata: Metadata = {
  title: "Promotional Products — Business Cards, Stickers, Banners & More",
  description:
    "Shop custom promotional products including business cards, stickers, banners, tents, magnets and flags.",
  alternates: {
    canonical: "/promotional-products",
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
  parent: number;
};

/**
 * Fetch all WooCommerce product categories.
 */
async function getAllCategories(): Promise<WooCategory[]> {
  const perPage = 100;
  const categories: WooCategory[] = [];

  for (let page = 1; page <= 100; page++) {
    const pageCategories = await wooCommerceRequest<WooCategory[]>(
      `/products/categories?per_page=${perPage}&page=${page}`
    );

    categories.push(...pageCategories);

    if (pageCategories.length < perPage) {
      return categories;
    }
  }

  throw new Error("Category pagination limit exceeded.");
}

/**
 * Fetch all products assigned to a category.
 */
async function getAllProductsForCategory(
  categoryId: number
): Promise<WooProduct[]> {
  const perPage = 100;
  const products: WooProduct[] = [];

  for (let page = 1; page <= 100; page++) {
    const pageProducts = await wooCommerceRequest<WooProduct[]>(
      `/products?category=${categoryId}&per_page=${perPage}&page=${page}`
    );

    products.push(...pageProducts);

    if (pageProducts.length < perPage) {
      return products;
    }
  }

  throw new Error(
    `Product pagination limit exceeded for category ${categoryId}.`
  );
}

/**
 * Fetch products from promotional products and all descendant categories.
 */
async function getPromotionalProducts(): Promise<WooProduct[]> {
  const categories = await getAllCategories();

  const rootCategory = categories.find(
    (category) => category.slug === "promotional-products"
  );

  if (!rootCategory) {
    console.error(
      "WooCommerce category 'promotional-products' was not found."
    );
    return [];
  }

  // Find the root category and every nested subcategory.
  const categoryIds = new Set<number>([rootCategory.id]);

  let foundDescendant = true;

  while (foundDescendant) {
    foundDescendant = false;

    for (const category of categories) {
      if (
        !categoryIds.has(category.id) &&
        categoryIds.has(category.parent)
      ) {
        categoryIds.add(category.id);
        foundDescendant = true;
      }
    }
  }

  // Fetch all category product lists in parallel.
  const productLists = await Promise.all(
    [...categoryIds].map((categoryId) =>
      getAllProductsForCategory(categoryId)
    )
  );

  // Deduplicate products assigned to multiple categories.
  const uniqueProducts = new Map<number, WooProduct>();

  for (const product of productLists.flat()) {
    uniqueProducts.set(product.id, product);
  }

  return [...uniqueProducts.values()];
}

/**
 * Format WooCommerce HTML descriptions as plain text.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function PromotionalProducts() {
  let products: WooProduct[] = [];
  let fetchFailed = false;

  try {
    products = await getPromotionalProducts();
  } catch (error) {
    fetchFailed = true;
    console.error("PROMOTIONAL_PRODUCTS_CATALOG_ERROR:", error);
  }

  // Only show products customers can purchase.
  const purchasableProducts = products.filter(
    (product) => product.price !== undefined
  );

  return (
    <>
      <PageHero
        eyebrow="Promotional Products"
        title="Everything you hand out, wear or hang up"
        description="Business cards to trade show tents — every promotional product ships with a free digital proof and fast turnaround."
        crumbs={[{ label: "Promotional Products" }]}
      />

      <section className="section-py container-px">
        <SectionHeading
          eyebrow="Shop by product"
          title="Promotional product catalog"
        />

        {fetchFailed ? (
          <div className="mt-12 rounded-xl border border-red-200 p-6 text-sm text-red-700">
            We couldn&apos;t load promotional products right now. Please try again
            later.
          </div>
        ) : purchasableProducts.length === 0 ? (
          <div className="mt-12 rounded-xl border border-primary-100 p-6 text-sm text-primary-400">
            No promotional products were found in this category.
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {purchasableProducts.map((product, index) => {
              const image = product.images?.[0];
              const description = stripHtml(
                product.short_description || product.description || ""
              );

              const price = product.price
                ? `$${product.price}`
                : null;

              return (
                <Reveal
                  delay={Math.min(index * 0.05, 0.5)}
                  key={product.id}
                >
                  <Link
                    href={`/promotional-products/${product.slug}`}
                    className="block h-full"
                  >
                    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                      <div className="overflow-hidden bg-primary-50">
                        {image?.src ? (
                          <img
                            src={image.src}
                            alt={image.alt || product.name}
                            loading={index < 3 ? "eager" : "lazy"}
                            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-48 items-center justify-center text-sm text-primary-400">
                            No image available
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-center justify-between">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                            <ArrowUpRight size={18} />
                          </span>

                          <ArrowUpRight
                            className="text-primary-100 transition-colors group-hover:text-accent-600"
                            size={18}
                          />
                        </div>

                        <h3 className="mt-4 font-display text-lg font-semibold">
                          {product.name}
                        </h3>

                        <p className="mt-2 flex-1 text-sm text-primary-400">
                          {description || "Explore customization options."}
                        </p>

                        {price && (
                          <p className="mt-4 font-semibold text-primary-900">
                            From {price}
                          </p>
                        )}

                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent-600">
                          View product
                          <ArrowUpRight size={16} />
                        </span>
                      </div>
                    </Card>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      <CtaBanner />
    </>
  );
}