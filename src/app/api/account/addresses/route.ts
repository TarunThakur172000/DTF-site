import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/server/auth/session";
import {
  getWooCustomer,
  updateWooCustomer,
} from "@/lib/server/woocommerce/customers";
import { validationError } from "@/lib/server/validation/response";
import { updateAddressSchema } from "@/lib/server/validation/address";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    if (!user.woocommerceCustomerId) {
      return NextResponse.json(
        {
          success: false,
          message: "WooCommerce customer not found.",
        },
        { status: 404 }
      );
    }

    const customer = await getWooCustomer(
      user.woocommerceCustomerId
    );

    return NextResponse.json({
      success: true,
      billing: customer.billing,
      shipping: customer.shipping,
    });
  } catch (error) {
    console.error("GET_ADDRESSES_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch addresses.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    if (!user.woocommerceCustomerId) {
      return NextResponse.json(
        {
          success: false,
          message: "WooCommerce customer not found.",
        },
        { status: 404 }
      );
    }

   const body = await request.json();

const result = updateAddressSchema.safeParse(body);

if (!result.success) {
  return validationError(result.error);
}

const { billing, shipping } = result.data;

   

    const customer = await updateWooCustomer(
      user.woocommerceCustomerId,
      {
        billing,
        shipping,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Addresses updated successfully.",
      billing: customer.billing,
      shipping: customer.shipping,
    });
  } catch (error) {
    console.error("UPDATE_ADDRESSES_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update addresses.",
      },
      { status: 500 }
    );
  }
}