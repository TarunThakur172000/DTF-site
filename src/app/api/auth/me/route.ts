import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth/session";

export async function GET() {
	const user = await getCurrentUser();

	if (!user) {
		return NextResponse.json(
			{ success: false, message: "Authentication required." },
			{ status: 401 }
		);
	}

	return NextResponse.json({
		success: true,
		user: {
			id: String(user._id),
			fullName: user.fullName,
			email: user.email,
			emailVerified: user.emailVerified,
			woocommerceCustomerId: user.woocommerceCustomerId ?? null,
		},
	});
}
