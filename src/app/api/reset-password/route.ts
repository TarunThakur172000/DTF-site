import { NextResponse } from "next/server";
import argon2 from "argon2";

import { connectDB } from "@/lib/server/db";
import User from "@/models/User";
import PasswordResetCode from "@/models/PasswordResetCode";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      email,
      otp,
      newPassword,
    } = body;

    // --------------------------------
    // 1. Validate input
    // --------------------------------

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Email, verification code and new password are required.",
        },
        { status: 400 }
      );
    }

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    if (
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code must be 6 digits.",
        },
        { status: 400 }
      );
    }

    if (
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // --------------------------------
    // 2. Connect database
    // --------------------------------

    await connectDB();

    // --------------------------------
    // 3. Find user
    // --------------------------------

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid verification code.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 4. Find reset code
    // --------------------------------

    const resetCode =
      await PasswordResetCode.findOne({
        userId: user._id,
      }).sort({ createdAt: -1 });

    if (!resetCode) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code has expired. Please request a new code.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 5. Check expiration
    // --------------------------------

    if (
      resetCode.expiresAt.getTime() <=
      Date.now()
    ) {
      await PasswordResetCode.deleteOne({
        _id: resetCode._id,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code has expired. Please request a new code.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 6. Check attempts
    // --------------------------------

    if (resetCode.attempts >= 5) {
      await PasswordResetCode.deleteOne({
        _id: resetCode._id,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Too many incorrect attempts. Please request a new code.",
        },
        { status: 429 }
      );
    }

    // --------------------------------
    // 7. Verify OTP
    // --------------------------------

    const otpValid = await argon2.verify(
      resetCode.codeHash,
      otp
    );

    if (!otpValid) {
      resetCode.attempts += 1;

      await resetCode.save();

      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid verification code.",
          attemptsRemaining:
            5 - resetCode.attempts,
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 8. Hash new password
    // --------------------------------

    const newPasswordHash =
      await argon2.hash(newPassword);

    // --------------------------------
    // 9. Update password
    // --------------------------------

    user.passwordHash = newPasswordHash;

    await user.save();

    // --------------------------------
    // 10. Delete used reset code
    // --------------------------------

    await PasswordResetCode.deleteOne({
      _id: resetCode._id,
    });

    // --------------------------------
    // 11. Return success
    // --------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Password reset successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "RESET_PASSWORD_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while resetting your password.",
      },
      { status: 500 }
    );
  }
}