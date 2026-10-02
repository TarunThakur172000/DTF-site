// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { checkoutCart, CheckoutError } from "@/lib/server/woocommerce/checkout";
import { getCurrentUser } from "@/lib/server/auth/session";
import { getPaymentMethods } from "@/lib/server/woocommerce/paymentMethods";

async function getCurrentUserId(): Promise<string | null> {
  const session = await getCurrentUser();

  if (!session?.id) return null;

  return String(session.id);
}

type CustomerInput = {
  email?: string;
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  phone?: string;
};

const REQUIRED: (keyof CustomerInput)[] = [
  "first_name",
  "email",
  "address_1",
  "city",
  "state",
  "postcode",
  "country",
];

export async function POST(req: Request) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Please log in to check out." },
      { status: 401 }
    );
  }

  let customer: CustomerInput | undefined;
  let paymentMethodId: string | undefined;

  try {
    ({ customer, paymentMethodId } = await req.json());
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  if (!customer) {
    return NextResponse.json(
      { success: false, message: "Customer details are required." },
      { status: 400 }
    );
  }

  if (typeof paymentMethodId !== "string" || !paymentMethodId.trim()) {
    return NextResponse.json(
      { success: false, message: "A payment method is required." },
      { status: 400 }
    );
  }

  const missing = REQUIRED.filter((f) => !String(customer![f] ?? "").trim());

  if (missing.length) {
    return NextResponse.json(
      { success: false, message: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const c = customer;

  // WordPress requires last_name; single-word names reuse the first name.
  const first_name = c.first_name!.trim();
  const last_name = (c.last_name ?? "").trim() || first_name;

  const address = {
    first_name,
    last_name,
    address_1: c.address_1!,
    address_2: c.address_2 ?? "",
    city: c.city!,
    state: c.state!,
    postcode: c.postcode!,
    country: c.country!,
  };

  try {
    const paymentMethods = await getPaymentMethods();
    const paymentMethod = paymentMethods.find(
      (method) => method.id === paymentMethodId
    );

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, message: "The selected payment method is unavailable." },
        { status: 400 }
      );
    }

    const order = await checkoutCart({
      userId,
      billing: { ...address, email: c.email!, phone: c.phone ?? "" },
      shipping: address,
      paymentMethodId: paymentMethod.id,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      total: order.total,
      currency: order.currency,
      payUrl: order.pay_url,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json(
        { success: false, message: error.message, code: error.code },
        { status: error.status }
      );
    }

    console.error("CHECKOUT_ROUTE_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong during checkout." },
      { status: 500 }
    );
  }
}