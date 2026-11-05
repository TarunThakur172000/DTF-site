import { randomUUID } from "node:crypto";

import {
  addItemToCart,
  cartErrorResponse,
  getCartOwner,
  getOrCreateCart,
} from "@/lib/server/cart";
import type { ICartArtwork, ICartItem } from "@/models/Cart";

const MAX_REQUEST_BYTES = 10 * 1024 * 1024;
const MAX_ARTWORK_FILES = 5;
const MAX_ARTWORK_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ARTWORK_TOTAL_BYTES = 8 * 1024 * 1024;

const ARTWORK_TYPES: Record<string, string> = {
  ai: "application/postscript",
  eps: "application/postscript",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  pdf: "application/pdf",
  png: "image/png",
  tif: "image/tiff",
  tiff: "image/tiff",
};

const FIELD_LIMITS = {
  width: 30,
  height: 30,
  jobName: 120,
  additionalService: 160,
  orderNotes: 2000,
  productSize: 120,
  customShape: 120,
  productType: 120,
  fullName: 120,
  business: 160,
  phone: 40,
  email: 254,
} as const;

type RequestFields = Record<string, unknown>;

function isRecord(value: unknown): value is RequestFields {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, maxLength: number) {
  if (value === undefined || value === null || value === "") {
    return "";
  }
  if (typeof value !== "string") {
    throw new Error("INVALID_FIELD");
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new Error("FIELD_TOO_LONG");
  }
  return normalized;
}

function readField(
  fields: RequestFields,
  formData: FormData | null,
  name: string,
  aliases: string[] = [],
  maxLength = 500
) {
  const names = [name, ...aliases];
  const value = names
    .map((fieldName) => formData?.get(fieldName) ?? fields[fieldName])
    .find((fieldValue) => fieldValue !== null && fieldValue !== undefined);
  return stringValue(value, maxLength);
}

async function readArtworks(formData: FormData | null) {
  if (!formData) {
    return [] as ICartArtwork[];
  }

  const uploads = [...formData.getAll("file"), ...formData.getAll("artwork")].filter(
    (value): value is File => value instanceof File && value.size > 0
  );

  if (uploads.length > MAX_ARTWORK_FILES) {
    throw new Error("TOO_MANY_ARTWORKS");
  }

  let totalBytes = 0;
  const artworks: ICartArtwork[] = [];

  for (const upload of uploads) {
    const extension = upload.name.split(".").pop()?.toLowerCase() ?? "";
    const contentType = ARTWORK_TYPES[extension];
    if (!contentType) {
      throw new Error("UNSUPPORTED_ARTWORK_TYPE");
    }

    if (upload.size > MAX_ARTWORK_FILE_BYTES) {
      throw new Error("ARTWORK_TOO_LARGE");
    }
    totalBytes += upload.size;
    if (totalBytes > MAX_ARTWORK_TOTAL_BYTES) {
      throw new Error("ARTWORK_TOTAL_TOO_LARGE");
    }

    const fileName = upload.name
      .replace(/[\\/\u0000-\u001f\u007f]/g, "_")
      .slice(-120);
    artworks.push({
      fileName: fileName || `artwork.${extension}`,
      contentType,
      data: Buffer.from(await upload.arrayBuffer()),
    });
  }

  return artworks;
}

function requestErrorResponse(error: unknown) {
  const cartResponse = cartErrorResponse(error);
  if (cartResponse) {
    return cartResponse;
  }

  if (!(error instanceof Error)) {
    return null;
  }

  const validationMessages: Record<string, { message: string; status: number }> = {
    INVALID_FIELD: { message: "Invalid cart item fields.", status: 400 },
    FIELD_TOO_LONG: { message: "A cart item field is too long.", status: 400 },
    TOO_MANY_ARTWORKS: { message: "Upload no more than five artwork files.", status: 400 },
    UNSUPPORTED_ARTWORK_TYPE: {
      message: "Artwork must be PNG, JPG, PDF, AI, EPS, TIF, or TIFF.",
      status: 400,
    },
    ARTWORK_TOO_LARGE: { message: "Each artwork file must be 5 MB or smaller.", status: 413 },
    ARTWORK_TOTAL_TOO_LARGE: {
      message: "The total artwork size must be 8 MB or smaller.",
      status: 413,
    },
  };
  const validation = validationMessages[error.message];
  return validation
    ? Response.json(
        { success: false, message: validation.message },
        { status: validation.status }
      )
    : null;
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return Response.json(
        { success: false, message: "Cart request is too large." },
        { status: 413 }
      );
    }

    const contentType = request.headers.get("content-type") ?? "";
    let fields: RequestFields;
    let formData: FormData | null = null;

    if (contentType.includes("multipart/form-data")) {
      formData = await request.formData();
      fields = {};
    } else if (contentType.includes("application/json")) {
      const rawBody = await request.text();
      if (Buffer.byteLength(rawBody, "utf8") > 64 * 1024) {
        return Response.json(
          { success: false, message: "Cart request is too large." },
          { status: 413 }
        );
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawBody);
      } catch {
        return Response.json(
          { success: false, message: "Invalid JSON request." },
          { status: 400 }
        );
      }
      if (!isRecord(parsed)) {
        return Response.json(
          { success: false, message: "Invalid cart item." },
          { status: 400 }
        );
      }
      fields = parsed;
    } else {
      return Response.json(
        { success: false, message: "Expected multipart form data or JSON." },
        { status: 415 }
      );
    }

    const productIdValue = readField(fields, formData, "productId", ["id"], 20);
    const productId = productIdValue ? Number(productIdValue) : null;
    if (
      productId !== null &&
      (!Number.isSafeInteger(productId) || productId <= 0)
    ) {
      return Response.json(
        { success: false, message: "Invalid product ID." },
        { status: 400 }
      );
    }

    const quantityValue = readField(fields, formData, "quantity", [], 10);
    const quantity = quantityValue ? Number(quantityValue) : 1;
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10000) {
      return Response.json(
        { success: false, message: "Quantity must be between 1 and 10,000." },
        { status: 400 }
      );
    }

    const email = readField(fields, formData, "email", [], FIELD_LIMITS.email);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { success: false, message: "Invalid email address." },
        { status: 400 }
      );
    }

    const item: ICartItem = {
      key: randomUUID(),
      productId,
      name:
        readField(fields, formData, "productName", ["name"], 200) ||
        "Custom Service Order",
      quantity,
      width: readField(fields, formData, "width", ["customWidth"], FIELD_LIMITS.width),
      height: readField(fields, formData, "height", ["customHeight"], FIELD_LIMITS.height),
      jobName: readField(
        fields,
        formData,
        "jobName",
        ["fullName"],
        FIELD_LIMITS.jobName
      ),
      additionalService: readField(
        fields,
        formData,
        "additionalService",
        ["addon", "material", "option"],
        FIELD_LIMITS.additionalService
      ),
      orderNotes: readField(
        fields,
        formData,
        "orderNotes",
        ["notes"],
        FIELD_LIMITS.orderNotes
      ),
      productSize: readField(fields, formData, "productSize", [], FIELD_LIMITS.productSize),
      customShape: readField(fields, formData, "customShape", [], FIELD_LIMITS.customShape),
      productType: readField(fields, formData, "productType", [], FIELD_LIMITS.productType),
      fullName: readField(fields, formData, "fullName", [], FIELD_LIMITS.fullName),
      business: readField(fields, formData, "business", [], FIELD_LIMITS.business),
      phone: readField(fields, formData, "phone", [], FIELD_LIMITS.phone),
      email,
      quoteRequired: true,
      artworks: await readArtworks(formData),
    };

    const owner = await getCartOwner();
    if (!owner) {
      return Response.json(
        { success: false, message: "Unable to identify cart owner." },
        { status: 401 }
      );
    }

    const cart = await getOrCreateCart(owner);
    await addItemToCart(cart, owner, item);

    return Response.json({ success: true, itemKey: item.key });
  } catch (error) {
    const response = requestErrorResponse(error);
    if (response) {
      return response;
    }

    console.error("ADD_CART_ITEM_ERROR:", error);
    return Response.json(
      { success: false, message: "Unable to add product to cart." },
      { status: 500 }
    );
  }
}
