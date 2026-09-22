//need to remove
export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero } from "../../../components/sections/PageHero";
import { FAQ_GENERAL } from "../../../data/site";
import { FaqAccordion } from "../../../components/ui/FaqAccordion";
import { QuoteForm } from "../../../components/forms/QuoteForm";
import { Reveal } from "../../../components/ui/Reveal";
import { CtaBanner } from "../../../components/sections/CtaBanner";
import { AddToCart } from "../../../components/product/AddToCart";
import { wooCommerceRequest } from "@/lib/server/woocommerce/client";
import { DTFProductForm } from "@/components/product/TFProductForm";

type WooProduct = {
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

async function getProduct(
  slug: string
): Promise<WooProduct | null> {
  try {
    const products =
      await wooCommerceRequest<WooProduct[]>(
        `/products?slug=${encodeURIComponent(slug)}`
      );

    return products[0] ?? null;
  } catch (error) {
    console.error(
      "Failed to fetch WooCommerce product:",
      error
    );

    return null;
  }
}

export async function generateStaticParams() {
  try {
    const products =
      await wooCommerceRequest<WooProduct[]>(
        "/products?category=transfer-printing&per_page=100"
      );

    return products.map((product) => ({
      method: product.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ method: string }>;
}): Promise<Metadata> {
  const { method } = await params;

  const product = await getProduct(method);

  if (!product) {
    return {};
  }

  return {
    title: `${product.name} — Transfer Printing`,
    description:
      product.short_description ||
      product.description.replace(/<[^>]*>/g, ""),
    alternates: {
      canonical: `/transfer-printing/${product.slug}`,
    },
  };
}

export default async function TransferDetail({
  params,
}: {
  params: Promise<{ method: string }>;
}) {
  const { method } = await params;

  const product = await getProduct(method);

  if (!product) {
    notFound();
  }

  const image = product.images?.[0];

  const transferAttributes =
    product.attributes?.filter(
      (attribute) => attribute.variation
    ) ?? [];

  return (
    <>
      <PageHero
        eyebrow="Transfer Printing"
        title={product.name}
        description="Full-color, photo-quality transfers that press onto cotton, polyester, blends and more — no weeding required."
        crumbs={[
          {
            label: "Transfer Printing",
            to: "/transfer-printing",
          },
          {
            label: product.name,
          },
        ]}
      />

      <section className="section-py container-px grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">

          {/* Product Image */}
          {image && (
            <Reveal>
              <img
                src={image.src}
                alt={image.alt || product.name}
                className="w-80 h-80 object-cover rounded-2xl shadow-card"
              />
            </Reveal>
          )}

          {/* Product Description */}
          <Reveal>
            <h2 className="text-2xl font-display font-bold">
              About this service
            </h2>

            <div
              className="mt-5 text-primary-400 leading-relaxed prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: product.description,
              }}
            />
          </Reveal>

          {/* Product Attributes */}
          {transferAttributes.length > 0 && (
            <Reveal>
              <h2 className="text-2xl font-display font-bold">
                Available options
              </h2>

              <div className="mt-5 grid sm:grid-cols-2 gap-3">
                {transferAttributes.map(
                  (attribute) => (
                    <div
                      key={attribute.id}
                      className="rounded-xl border border-primary-50 bg-white px-4 py-4"
                    >
                      <p className="text-sm font-semibold text-primary-900">
                        {attribute.name}
                      </p>

                      <p className="mt-1 text-sm text-primary-400">
                        {attribute.options.join(", ")}
                      </p>
                    </div>
                  )
                )}
              </div>
            </Reveal>
          )}

          {/* Starting Price */}
          <Reveal>
            <h2 className="text-2xl font-display font-bold">
              Starting price
            </h2>

            <p className="mt-3 text-3xl font-display font-bold text-accent-600">
              {product.price
                ? `$${product.price}`
                : "Request a quote"}
            </p>

            <p className="mt-2 text-sm text-primary-400">
              Final pricing depends on size, quantity and
              complexity — request a quote for exact
              numbers.
            </p>
          </Reveal>

          {/* FAQ */}
          <Reveal>
            <h2 className="text-2xl font-display font-bold mb-5">
              FAQ
            </h2>

            <FaqAccordion items={FAQ_GENERAL} />
          </Reveal>

          <Link
            href="/transfer-printing"
            className="inline-block text-sm font-semibold text-accent-600 hover:underline"
          >
            ← Back to all transfer methods
          </Link>
        </div>

        {/* Right Sidebar */}

        <Reveal className="lg:col-span-1">
          <div className="rounded-2xl border border-primary-50 bg-white p-6 shadow-card sticky top-28">

            <h3 className="font-display font-semibold text-lg mb-1">
              Order this service
            </h3>

            <p className="text-sm text-primary-400 mb-5">
              Select your options and quantity, then add
              this service to your cart.
            </p>

            {/* Conditionally render the custom DTF form or the standard form */}
           
              <DTFProductForm productId={product.id} />
           

          </div>
        </Reveal>
      </section>

      <CtaBanner />
    </>
  );
}