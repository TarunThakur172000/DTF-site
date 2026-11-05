import { NextResponse } from "next/server";
import argon2 from "argon2";

import { connectDB } from "@/lib/server/db";
import User from "@/models/User";
import { createSession } from "@/lib/server/auth/session";
import { mergeGuestCartIntoUser } from "@/lib/server/cart";
import { loginSchema } from "@/lib/server/validation/auth";
import { validationError } from "@/lib/server/validation/response";

export async function POST(request: Request) {
  try {
    // -----------------------------------
    // 1. Read request body
    // -----------------------------------
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return validationError(result.error);
    }

    const { email, password } = result.data;

    // -----------------------------------
    // 2. Connect MongoDB
    // -----------------------------------
    await connectDB();

    // -----------------------------------
    // 3. Find user
    // -----------------------------------
    const user = await User.findOne({
      email: email,
    });

    // -----------------------------------
    // 4. User doesn't exist
    // -----------------------------------
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // -----------------------------------
    // 5. Check email verification
    // -----------------------------------
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Please verify your email before logging in.",
          requiresVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    // -----------------------------------
    // 6. Verify password
    // -----------------------------------
    const passwordValid = await argon2.verify(
      user.passwordHash,
      password
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // -----------------------------------
    // 7. Move the browser's guest cart into the account before changing identity.
    try {
      await mergeGuestCartIntoUser(user._id.toString());
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "CART_MERGE_LIMIT_EXCEEDED" ||
          error.message === "CART_MERGE_CONFLICT")
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Your guest cart could not be merged because the account cart has reached its limit. Please remove some items and try again.",
          },
          { status: 409 }
        );
      }

      throw error;
    }

    // 8. Create application session
    // -----------------------------------
    await createSession(user._id.toString());

    // -----------------------------------
    // 9. Return success
    // -----------------------------------
    return NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        user: {
          id: user._id.toString(),
          fullName: user.fullName,
          businessName: user.businessName,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("LOGIN_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while logging in.",
      },
      { status: 500 }
    );
  }
}
