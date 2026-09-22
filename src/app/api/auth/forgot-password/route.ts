import { NextResponse } from "next/server";

import { connectDB } from "@/lib/server/db";
import User from "@/models/User";
import PasswordResetCode from "@/models/PasswordResetCode";

import {
  generateOTP,
  hashOTP,
} from "@/lib/server/auth/otp";

import { sendPasswordResetCode } from "@/lib/server/email/passwordResetEmail";
import { validationError } from "@/lib/server/validation/response";
import { forgotPasswordSchema } from "@/lib/server/validation/auth";

export async function POST(request: Request) {
  try {
   const body = await request.json();

const result = forgotPasswordSchema.safeParse(body);

if (!result.success) {
  return validationError(result.error);
}

const { email } = result.data;

    // // --------------------------------
    // // 1. Validate email
    // // --------------------------------

    // if (
    //   typeof email !== "string" ||
    //   !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    //     email.trim()
    //   )
    // ) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: "Please provide a valid email address.",
    //     },
    //     { status: 400 }
    //   );
    // }

    // const normalizedEmail = email
    //   .trim()
    //   .toLowerCase();

    // // --------------------------------
    // // 2. Connect database
    // // --------------------------------

    // await connectDB();

    // // --------------------------------
    // // 3. Find user
    // // --------------------------------

    const user = await User.findOne({
      email: email,
    });

    /*
     * Important:
     * Don't reveal whether an email exists.
     *
     * This prevents attackers from using the
     * forgot-password endpoint to discover
     * registered email addresses.
     */

    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message:
            "If an account exists with this email, a password reset code has been sent.",
        },
        { status: 200 }
      );
    }

    // --------------------------------
    // 4. User must have verified email
    // --------------------------------

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          message:
            "If an account exists with this email, a password reset code has been sent.",
        },
        { status: 200 }
      );
    }

    // --------------------------------
    // 5. Check existing reset code
    // --------------------------------

    const existingCode =
      await PasswordResetCode.findOne({
        userId: user._id,
      }).sort({ createdAt: -1 });

    /*
     * Don't generate another code while
     * the previous one is still valid.
     */

    if (
      existingCode &&
      existingCode.expiresAt.getTime() >
        Date.now()
    ) {
      return NextResponse.json(
        {
          success: true,
          message:
            "A password reset code has already been sent. Please check your email.",
        },
        { status: 200 }
      );
    }

    // --------------------------------
    // 6. Delete expired code
    // --------------------------------

    if (existingCode) {
      await PasswordResetCode.deleteOne({
        _id: existingCode._id,
      });
    }

    // --------------------------------
    // 7. Generate OTP
    // --------------------------------

    const otp = generateOTP();

    // --------------------------------
    // 8. Hash OTP
    // --------------------------------

    const codeHash = await hashOTP(otp);

    // --------------------------------
    // 9. Expire after 10 minutes
    // --------------------------------

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // --------------------------------
    // 10. Store reset code
    // --------------------------------

    await PasswordResetCode.create({
      userId: user._id,
      codeHash,
      expiresAt,
      attempts: 0,
    });

    // --------------------------------
    // 11. Send email
    // --------------------------------

    await sendPasswordResetCode(
      user.email,
      user.fullName,
      otp
    );

    // --------------------------------
    // 12. Response
    // --------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "If an account exists with this email, a password reset code has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "FORGOT_PASSWORD_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}