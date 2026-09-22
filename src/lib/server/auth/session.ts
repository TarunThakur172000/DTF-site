import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/server/db";
import User from "@/models/User";
import Session from "@/models/Session";

const SESSION_COOKIE_NAME = "session";

const SESSION_DURATION =
  7 * 24 * 60 * 60 * 1000; // 7 days

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

/**
 * Create a new login session.
 */
export async function createSession(userId: string) {
  await connectDB();

  const token = generateToken();
  const tokenHash = hashToken(token);

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION
  );

  await Session.create({
    userId,
    tokenHash,
    expiresAt,
  });

  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,

    httpOnly: true,

    secure:
      process.env.NODE_ENV === "production",

    sameSite: "lax",

    path: "/",

    maxAge: SESSION_DURATION / 1000,
  });
}

/**
 * Get the currently logged-in user.
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get(
      SESSION_COOKIE_NAME
    );

    if (!sessionCookie?.value) {
      return null;
    }

    const token = sessionCookie.value;

    const tokenHash = hashToken(token);

    await connectDB();

    const session = await Session.findOne({
      tokenHash,
    });

    if (!session) {
      await clearSession();
      return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await Session.deleteOne({
        _id: session._id,
      });

      await clearSession();

      return null;
    }

    const user = await User.findById(
      session.userId
    ).select("-passwordHash");

    if (!user) {
      await Session.deleteOne({
        _id: session._id,
      });

      await clearSession();

      return null;
    }

    // Do not allow unverified users
    // to access authenticated areas.
    if (!user.emailVerified) {
      await Session.deleteOne({
        _id: session._id,
      });

      await clearSession();

      return null;
    }

    return user;
  } catch (error) {
    console.error(
      "GET_CURRENT_USER_ERROR:",
      error
    );

    return null;
  }
}

/**
 * Delete the current session.
 */
export async function clearSession() {
  try {
    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get(
      SESSION_COOKIE_NAME
    );

    if (sessionCookie?.value) {
      const tokenHash = hashToken(
        sessionCookie.value
      );

      await connectDB();

      await Session.deleteOne({
        tokenHash,
      });
    }

    cookieStore.delete(
      SESSION_COOKIE_NAME
    );
  } catch (error) {
    console.error(
      "CLEAR_SESSION_ERROR:",
      error
    );
  }
}

/**
 * Check whether the user is authenticated.
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();

  return user !== null;
}