import { NextResponse } from "next/server";

import { connectDB } from "@/lib/server/db";

import User from "@/models/User";
import VerificationCode from "@/models/VerificationCode";

import { verifyOTP } from "@/lib/server/auth/otp";

import {
  findWooCustomerByEmail,
  createWooCustomer,
} from "@/lib/server/woocommerce/customers";
import { validationError } from "@/lib/server/validation/response";
import { verifyEmailSchema } from "@/lib/server/validation/auth";
export async function POST(request: Request) {
  try {
    const body = await request.json();

const result = verifyEmailSchema.safeParse(body);

if (!result.success) {
  return validationError(result.error);
}

console.log("Request body:", body);

const { email, otp } = result.data;

    // // --------------------------------
    // // 1. Validate input
    // // --------------------------------

    // if (!email || !otp) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: "Email and verification code are required.",
    //     },
    //     { status: 400 }
    //   );
    // }

    // if (typeof email !== "string") {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: "Invalid email address.",
    //     },
    //     { status: 400 }
    //   );
    // }

    // if (
    //   typeof otp !== "string" ||
    //   !/^\d{6}$/.test(otp)
    // ) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: "Verification code must be 6 digits.",
    //     },
    //     { status: 400 }
    //   );
    // }

    // const normalizedEmail = email
    //   .trim()
    //   .toLowerCase();

    // await connectDB();

    // // --------------------------------
    // // 2. Find user
    // // --------------------------------

   
    const user = await User.findOne({
      email: email,
    });

   console.log("Found user:", user); 
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification request.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 3. Check if already verified
    // --------------------------------

    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          message: "Email is already verified.",
        },
        { status: 200 }
      );
    }

    // --------------------------------
    // 4. Find latest verification code
    // --------------------------------
    console.log("Finding latest verification code for user:", user._id);
    const verification =
      await VerificationCode.findOne({
        userId: user._id,
      }).sort({ createdAt: -1 });

    if (!verification) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification code has expired or does not exist. Please request a new code.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 5. Check expiry
    // --------------------------------

    if (
      verification.expiresAt.getTime() <
      Date.now()
    ) {
      await VerificationCode.deleteOne({
        _id: verification._id,
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

    if (verification.attempts >= 5) {
      await VerificationCode.deleteOne({
        _id: verification._id,
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

    const isValid = await verifyOTP(
      otp,
      verification.codeHash
    );

    if (!isValid) {
      verification.attempts += 1;

      await verification.save();

      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification code.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // 8. OTP is valid
    // --------------------------------

    /*
     * Check if a WooCommerce customer with
     * this email already exists.
     *
     * This prevents duplicate WooCommerce
     * customers if verification is retried.
     */

    let wooCustomer =
      await findWooCustomerByEmail(user.email);

    // --------------------------------
    // 9. Create WooCommerce customer
    // --------------------------------

    if (!wooCustomer) {
      const nameParts = user.fullName
        .trim()
        .split(/\s+/);

      const firstName = nameParts[0];

      const lastName =
        nameParts.length > 1
          ? nameParts.slice(1).join(" ")
          : "";

      wooCustomer = await createWooCustomer({
        email: user.email,
        firstName,
        lastName,
        businessName: user.businessName,
      });
    }

    // --------------------------------
    // 10. Update MongoDB user
    // --------------------------------

    user.emailVerified = true;

    user.woocommerceCustomerId =
      wooCustomer.id;

    await user.save();

    // --------------------------------
    // 11. Delete used OTP
    // --------------------------------

    await VerificationCode.deleteOne({
      _id: verification._id,
    });

    // --------------------------------
    // 12. Return success
    // --------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Email verified successfully.",
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          businessName: user.businessName,
          email: user.email,
          emailVerified: user.emailVerified,
          woocommerceCustomerId:
            user.woocommerceCustomerId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "VERIFY_EMAIL_ERROR:",
      error
    );
    console.log(NextResponse.error)
    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while verifying your email.",
      },
      { status: 500 }
    );
  }
}