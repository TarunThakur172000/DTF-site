import { NextResponse } from "next/server";
import { connectDB } from "@/lib/server/db";
import { generateOTP, hashOTP } from "@/lib/server/auth/otp";
import { sendVerificationCode } from "@/lib/server/email/verificationEmail";
import { validationError } from "@/lib/server/validation/response";
import { resendOtpSchema } from "@/lib/server/validation/auth";
import User from "@/models/User";
import VerificationCode from "@/models/VerificationCode";

const RESEND_COOLDOWN_MS = 60_000;
const OTP_LIFETIME_MS = 10 * 60_000;

export async function POST(request: Request) {
	try {
		const body: unknown = await request.json();
		const parsed = resendOtpSchema.safeParse(body);

		if (!parsed.success) {
			return validationError(parsed.error);
		}

		await connectDB();

		const email = parsed.data.email.trim().toLowerCase();
		const user = await User.findOne({ email });
		const genericResponse = {
			success: true,
			message: "If this account can be verified, a new code has been sent.",
		};

		if (!user || user.emailVerified) {
			return NextResponse.json(genericResponse);
		}

		const latestCode = await VerificationCode.findOne({
			userId: user._id,
		}).sort({ createdAt: -1 });

		if (
			latestCode &&
			Date.now() - latestCode.createdAt.getTime() < RESEND_COOLDOWN_MS
		) {
			return NextResponse.json(genericResponse);
		}

		const otp = generateOTP();
		const codeHash = await hashOTP(otp);

		await VerificationCode.deleteMany({ userId: user._id });
		await VerificationCode.create({
			userId: user._id,
			codeHash,
			expiresAt: new Date(Date.now() + OTP_LIFETIME_MS),
			attempts: 0,
		});

		await sendVerificationCode(user.email, user.fullName, otp);

		return NextResponse.json(genericResponse);
	} catch (error) {
		console.error("RESEND_OTP_ERROR:", error);
		return NextResponse.json(
			{ success: false, message: "Unable to resend the code right now." },
			{ status: 500 }
		);
	}
}
