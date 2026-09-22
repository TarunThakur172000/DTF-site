import "server-only";

import crypto from "crypto";
import argon2 from "argon2";

/**
 * Generate a secure 6-digit OTP.
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Hash OTP before storing it in MongoDB.
 */
export async function hashOTP(otp: string): Promise<string> {
  return argon2.hash(otp);
}

/**
 * Verify a user-provided OTP against the stored hash.
 */
export async function verifyOTP(
  otp: string,
  codeHash: string
): Promise<boolean> {
  return argon2.verify(codeHash, otp);
}