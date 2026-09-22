import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth/session";
import { connectDB } from "@/lib/server/db";
import User from "@/models/User"; // Adjust this path if your model is elsewhere

export async function PATCH(request: Request) {
  try {
      // 1. Authenticate the request
      const sessionUser = await getCurrentUser();
      if (!sessionUser) {
          return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

    // 2. Parse the form data
    const body = await request.json();
       

    // 3. Connect to MongoDB
    await connectDB();

    // 4. Update the user in the database
    // We omit 'email' from the update object for security (preventing account hijacking)
    await User.findByIdAndUpdate(sessionUser._id, {
      fullName: body.name,
      businessName: body.business,
      phone: body.phone,
    });

    

    return NextResponse.json(
      { success: true, message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}