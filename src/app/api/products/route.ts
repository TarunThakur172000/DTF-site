import { NextRequest, NextResponse } from "next/server";

import { getProducts } from "../../../lib/server/woocommerce/products";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const page = Number(searchParams.get("page") ?? "1");
    const perPage = Number(searchParams.get("limit") ?? "20");
    const search = searchParams.get("search") ?? "";

    const products = await getProducts({
      page,
      perPage,
      search,
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Products API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRODUCTS_FETCH_FAILED",
          message: "Unable to fetch products",
        },
      },
      { status: 500 }
    );
  }
}