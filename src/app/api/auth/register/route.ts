import { NextResponse } from "next/server";
import argon2 from "argon2";

import { connectDB } from "@/lib/server/db";
import User from "@/models/User";
import VerificationCode from "@/models/VerificationCode";
import { registerSchema } from "@/lib/server/validation/auth";
import { validationError } from "@/lib/server/validation/response";

import {
  generateOTP,
  hashOTP,
} from "@/lib/server/auth/otp";

import { sendVerificationCode } from "@/lib/server/email/verificationEmail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
 const result = registerSchema.safeParse(body);

    if (!result.success) {
      return validationError(result.error);
    }
    const {
      fullName,
      businessName,
      email,
      password,
    } = body;



    if (
      typeof password !== "string" ||
      password.length < 8
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

    // --------------------------------
    // Normalize email
    // --------------------------------

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    await connectDB();

    // --------------------------------
    // Check existing user
    // --------------------------------
const existingUser = await User.findOne({
  email: normalizedEmail,
});

if (existingUser?.emailVerified) {
  return NextResponse.json(
    {
      success: false,
      message: "An account with this email already exists.",
    },
    { status: 409 }
  );
}

// --------------------------------
//  Hash password
// --------------------------------

const passwordHash = await argon2.hash(password);

// --------------------------------
// Create or update user
// --------------------------------

let user;

if (existingUser) {
  // Existing account is not verified.
  // Update it and restart verification.
  existingUser.fullName = fullName.trim();
  existingUser.businessName =
    typeof businessName === "string"
      ? businessName.trim()
      : "";
  existingUser.passwordHash = passwordHash;
  existingUser.emailVerified = false;

  user = await existingUser.save();
} else {
  user = await User.create({
    fullName: fullName.trim(),

    businessName:
      typeof businessName === "string"
        ? businessName.trim()
        : "",

    email: normalizedEmail,

    passwordHash,

    emailVerified: false,

    // WooCommerce customer will be created
    // after email verification.
    woocommerceCustomerId: null,
  });
}

    // --------------------------------
    //  Generate OTP
    // --------------------------------

    const otp = generateOTP();

    // --------------------------------
    //  Hash OTP
    // --------------------------------

    const codeHash = await hashOTP(otp);

    // --------------------------------
    //  OTP expires in 10 minutes
    // --------------------------------

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // --------------------------------
    //  Save verification code
    // --------------------------------
console.log("Saving verification code for user:", user._id);
    await VerificationCode.create({
      userId: user._id,
      codeHash,
      expiresAt,
      attempts: 0,
    });


    // --------------------------------
    //  Send verification email
    // --------------------------------

    await sendVerificationCode(
      user.email,
      user.fullName,
      otp
    );

    // --------------------------------
    //  Return response
    // --------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Account created successfully. A verification code has been sent to your email.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "REGISTER_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while creating your account.",
      },
      { status: 500 }
    );
  }
}