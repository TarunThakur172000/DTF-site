import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { PageHero } from "../../../components/sections/PageHero";
import { FAQ_GENERAL } from "../../../data/site";
import { FaqAccordion } from "../../../components/ui/FaqAccordion";
import { Reveal } from "../../../components/ui/Reveal";
import { CtaBanner } from "../../../components/sections/CtaBanner";

import { wooCommerceRequest } from "@/lib/server/woocommerce/client";
import PromotionalForm, { ProductType } from "@/components/product/PromotionalForm";

export const dynamic = "force-dynamic";

type WooProduct = {
  type: ProductType;
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
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
  attributes: {
    id: number;
    name: string;
    slug: string;
    options: string[];
    variation: boolean;
  }[];
  variations: number[];
};

/**
 * Fetch a WooCommerce product using its slug.
 */
async function getProduct(slug: string): Promise<WooProduct | null> {
  try {
    const products = await wooCommerceRequest<WooProduct[]>(
      `/products?slug=${encodeURIComponent(slug)}`
    );

    return products[0] ?? null;
  } catch (error) {
    console.error("PROMOTIONAL_PRODUCT_FETCH_ERROR:", error);
    return null;
  }
}

/**
 * Generate product routes for static generation where supported.
 */
export async function generateStaticParams() {
  try {
    const products = await wooCommerceRequest<WooProduct[]>(
      "/products?category=promotional-products&per_page=100"
    );

    return products.map((product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error("PROMOTIONAL_PRODUCT_PARAMS_ERROR:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | Promotional Products",
    };
  }

  const description = (
    product.short_description ||
    product.description.replace(/<[^>]*>/g, "")
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return {
    title: `${product.name} | Promotional Products`,
    description,
    alternates: {
      canonical: `/promotional-products/${product.slug}`,
    },
  };
}

export default async function PromotionalProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const image = product.images?.[0];

  // Show product attributes that have selectable options.
  const productAttributes =
    product.attributes?.filter(
      (attribute) => attribute.options?.length > 0
    ) ?? [];

  const price = product.price
    ? `$${product.price}`
    : "Request a quote";

  return (
    <>
      <PageHero
        eyebrow="Promotional Products"
        title={product.name}
        description={
          product.short_description
            ? product.short_description.replace(/<[^>]*>/g, "").trim()
            : "Customize your promotional products to match your business. Choose your options and request a quote or add your product to the cart."
        }
        crumbs={[
          {
            label: "Promotional Products",
            to: "/promotional-products",
          },
          {
            label: product.name,
          },
        ]}
      />

      <section className="section-py container-px grid gap-12 lg:grid-cols-3">
        {/* Main product content */}
        <div className="space-y-10 lg:col-span-2">
          {/* Product image */}
          {image && (
            <Reveal>
              <img
                src={image.src}
                alt={image.alt || product.name}
                className="h-auto max-h-[520px] w-full rounded-2xl object-cover shadow-card"
              />
            </Reveal>
          )}

          {/* Product description */}
          <Reveal>
            <h2 className="font-display text-2xl font-bold">
              About this product
            </h2>

            {product.description ? (
              <div
                className="prose mt-5 max-w-none leading-relaxed text-primary-400"
                dangerouslySetInnerHTML={{
                  __html: product.description,
                }}
              />
            ) : (
              <p className="mt-5 leading-relaxed text-primary-400">
                Contact us for more information about this product and its
                customization options.
              </p>
            )}
          </Reveal>

          {/* Product options */}
          {productAttributes.length > 0 && (
            <Reveal>
              <h2 className="font-display text-2xl font-bold">
                Available options
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {productAttributes.map((attribute) => (
                  <div
                    key={attribute.id || attribute.slug}
                    className="rounded-xl border border-primary-50 bg-white px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-primary-900">
                      {attribute.name}
                    </p>

                    <p className="mt-1 text-sm text-primary-400">
                      {attribute.options.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {/* Product price */}
          <Reveal>
            <h2 className="font-display text-2xl font-bold">
              Pricing
            </h2>

            <p className="mt-3 font-display text-3xl font-bold text-accent-600">
              {price}
            </p>

            <p className="mt-2 text-sm text-primary-400">
              Pricing may vary based on quantity, size, material, and
              customization options.
            </p>
          </Reveal>

          {/* FAQs */}
          <Reveal>
            <h2 className="mb-5 font-display text-2xl font-bold">
              Frequently asked questions
            </h2>

            <FaqAccordion items={FAQ_GENERAL} />
          </Reveal>

          <Link
            href="/promotional-products"
            className="inline-block text-sm font-semibold text-accent-600 hover:underline"
          >
            ← Back to all promotional products
          </Link>
        </div>

        {/* Order sidebar */}
        <Reveal className="lg:col-span-1">
          <div className="sticky top-28 rounded-2xl border border-primary-50 bg-white p-6 shadow-card">
            <h3 className="mb-1 font-display text-lg font-semibold">
              Customize your product
            </h3>

            <p className="mb-5 text-sm text-primary-400">
              Select your product options and quantity, then add it to your
              cart.
            </p>

            <PromotionalForm  productId={product.id} productType={product.type} productName={product.name} />
          </div>
        </Reveal>
      </section>

      <CtaBanner />
    </>
  );
}