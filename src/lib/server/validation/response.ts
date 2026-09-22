import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function validationError(error: ZodError) {
  return NextResponse.json(
    {
      success: false,
      message: "Invalid request data.",
      errors: error.flatten().fieldErrors,
    },
    {
      status: 400,
    }
  );
}