export async function POST() {
  return Response.json(
    {
      success: false,
      message: "Coupons are not available for local carts yet.",
    },
    { status: 501 }
  );
}