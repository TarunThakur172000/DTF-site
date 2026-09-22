import { cookies } from "next/headers";
import {getCurrentUser} from "@/lib/server/auth/session";

const WORDPRESS_URL = process.env.WOOCOMMERCE_BASE_URL;
const STORE_SECRET = process.env.WP_STORE_SECRET;

export async function POST(request: Request) {
  try {
    if (!WORDPRESS_URL) {
      throw new Error("WOOCOMMERCE_BASE_URL is missing");
    }

    if (!STORE_SECRET) {
      throw new Error("WP_STORE_SECRET is missing");
    }

    // Get logged-in user from your Next.js session
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "You must be logged in to add items to cart",
        },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    let productId = 0;
    let quantity = 1;
    let width = "";
    let height = "";
    let jobName = "";
    let additionalService = "";
    let orderNotes = "";
    let file: File | null = null;

    /*
     * Handle multipart/form-data
     */
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      productId = Number(
        formData.get("productId") || formData.get("id")
      );

      quantity = Number(formData.get("quantity") ?? 1);

      width = String(formData.get("width") || "");
      height = String(formData.get("height") || "");
      jobName = String(formData.get("jobName") || "");
      additionalService = String(
        formData.get("additionalService") || ""
      );
      orderNotes = String(formData.get("orderNotes") || "");

      const uploadedFile = formData.get("file");

      if (uploadedFile instanceof File && uploadedFile.size > 0) {
        file = uploadedFile;
      }
    }

    /*
     * Handle JSON
     */
    else {
      const body = await request.json();

      productId = Number(
        body.productId || body.id
      );

      quantity = Number(body.quantity ?? 1);

      width = body.width || "";
      height = body.height || "";
      jobName = body.jobName || "";
      additionalService = body.additionalService || "";
      orderNotes = body.orderNotes || "";
    }

    /*
     * Validate product
     */
    if (!Number.isInteger(productId) || productId <= 0) {
      return Response.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    /*
     * Validate quantity
     */
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return Response.json(
        {
          success: false,
          message: "Invalid quantity",
        },
        { status: 400 }
      );
    }

    /*
     * Prepare multipart request for WordPress
     */
    const formData = new FormData();

    formData.append("id", String(productId));
    formData.append("quantity", String(quantity));
    formData.append("width", width);
    formData.append("height", height);
    formData.append("jobName", jobName);
    formData.append(
      "additionalService",
      additionalService
    );
    formData.append("orderNotes", orderNotes);

    if (file) {
      formData.append("file", file, file.name);
    }

    /*
     * Send cart request to custom WordPress plugin
     */
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/mystore/v1/add`,
      {
        method: "POST",

        headers: {
          "x-store-secret": STORE_SECRET,

          // IMPORTANT:
          // This comes from the authenticated Next.js session.
          "x-user-id": user.id,
        },

        body: formData,

        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "WordPress cart error:",
        response.status,
        data
      );

      return Response.json(
        {
          success: false,
          message:
            data?.message ||
            "Unable to add product to cart",
          error: data,
        },
        {
          status: response.status,
        }
      );
    }

    return Response.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error(
      "Add to cart API route error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Unable to add product to cart",
      },
      {
        status: 500,
      }
    );
  }
}