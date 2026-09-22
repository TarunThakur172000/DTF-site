import "server-only";

import { wooCommerceRequest } from "./client";

export interface WooProductImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: string;

  description: string;
  short_description: string;

  price: string;
  regular_price: string;
  sale_price: string;

  on_sale: boolean;
  purchasable: boolean;

  sku: string;

  stock_status: string;
  stock_quantity: number | null;

  featured: boolean;

  images: WooProductImage[];

  categories: {
    id: number;
    name: string;
    slug: string;
  }[];

  attributes: unknown[];
  variations: number[];
}

export async function getProducts(params?: {
  page?: number;
  perPage?: number;
  search?: string;
}) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params?.page ?? 1));
  searchParams.set("per_page", String(params?.perPage ?? 20));

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  return wooCommerceRequest<WooProduct[]>(
    `/products?${searchParams.toString()}`
  );
}

export async function getProduct(id: string) {
  return wooCommerceRequest<WooProduct>(
    `/products/${encodeURIComponent(id)}`
  );
}