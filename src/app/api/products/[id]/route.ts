import { NextResponse } from "next/server";

import { getProduct } from "../../../../lib/server/woocommerce/products";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PRODUCT_ID",
            message: "Invalid product ID",
          },
        },
        { status: 400 }
      );
    }

    const product = await getProduct(id);

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Product API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRODUCT_FETCH_FAILED",
          message: "Unable to fetch product",
        },
      },
      { status: 500 }
    );
  }
}