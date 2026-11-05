import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";

import Cart, { type ICart, type ICartItem } from "@/models/Cart";
import { connectDB } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth/session";

export const GUEST_CART_COOKIE = "guest_cart_id";
export const MAX_CART_ITEMS = 50;
export const MAX_CART_ARTWORK_BYTES = 8 * 1024 * 1024;
const GUEST_CART_MAX_AGE = 30 * 24 * 60 * 60;
const GUEST_CART_TTL = GUEST_CART_MAX_AGE * 1000;

export type CartOwner = {
  type: "user" | "guest";
  id: string;
};

function hashGuestId(id: string) {
  return createHash("sha256").update(id).digest("hex");
}

function isGuestId(value: string | undefined): value is string {
  return Boolean(value && /^[a-f0-9]{64}$/i.test(value));
}

export async function getCartOwner(
  createGuest = true
): Promise<CartOwner | null> {
  const user = await getCurrentUser();
  if (user) {
    return { type: "user", id: String(user._id) };
  }

  const cookieStore = await cookies();
  const existingId = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (isGuestId(existingId)) {
    return { type: "guest", id: hashGuestId(existingId) };
  }

  if (!createGuest) {
    return null;
  }

  const guestId = randomBytes(32).toString("hex");
  cookieStore.set(GUEST_CART_COOKIE, guestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_CART_MAX_AGE,
  });

  return { type: "guest", id: hashGuestId(guestId) };
}

export async function getCart(owner: CartOwner) {
  await connectDB();
  return Cart.findOne({ ownerType: owner.type, ownerId: owner.id });
}

export async function getOrCreateCart(owner: CartOwner): Promise<ICart> {
  const existing = await getCart(owner);
  if (existing) {
    return existing;
  }

  try {
    return await Cart.create({
      ownerType: owner.type,
      ownerId: owner.id,
      items: [],
      ...(owner.type === "guest"
        ? { expiresAt: new Date(Date.now() + GUEST_CART_TTL) }
        : {}),
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      const cart = await getCart(owner);
      if (cart) {
        return cart;
      }
    }

    throw error;
  }
}

export function refreshGuestCart(cart: ICart, owner: CartOwner) {
  if (owner.type === "guest") {
    cart.expiresAt = new Date(Date.now() + GUEST_CART_TTL);
  }
}

export function toCartResponse(cart: ICart | null) {
  const items = (cart?.items ?? []).map((item) => ({
    key: item.key,
    id: item.productId,
    quantity: item.quantity,
    name: item.name,
    width: item.width,
    height: item.height,
    jobName: item.jobName,
    additionalService: item.additionalService,
    orderNotes: item.orderNotes,
    productSize: item.productSize,
    customShape: item.customShape,
    productType: item.productType,
    fullName: item.fullName,
    business: item.business,
    phone: item.phone,
    email: item.email,
    quoteRequired: item.quoteRequired,
    image: "/images/Banner.webp",
    fileUrl: item.artworks.length
      ? `/api/cart/${encodeURIComponent(item.key)}/artwork/0`
      : "",
    artworks: item.artworks.map((artwork, index) => ({
      fileName: artwork.fileName,
      url: `/api/cart/${encodeURIComponent(item.key)}/artwork/${index}`,
    })),
    artworkCount: item.artworks.length,
  }));

  return {
    success: true,
    items,
    cartCount: items.reduce((count, item) => count + item.quantity, 0),
    totals: {
      subtotal: null,
      shipping: null,
      tax: null,
      total: null,
      currency_symbol: "$",
      quoteRequired: true,
    },
  };
}

export async function mergeGuestCartIntoUser(userId: string) {
  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_CART_COOKIE)?.value;

  if (!isGuestId(guestId)) {
    cookieStore.delete(GUEST_CART_COOKIE);
    return;
  }

  await connectDB();
  const guestOwner = { type: "guest" as const, id: hashGuestId(guestId) };
  const guestCart = await getCart(guestOwner);

  if (!guestCart) {
    cookieStore.delete(GUEST_CART_COOKIE);
    return;
  }

  if (guestCart.items.length) {
    const userCart = await getOrCreateCart({ type: "user", id: userId });
    const guestItems: ICartItem[] = guestCart.items.map((item) => ({
      key: randomUUID(),
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      width: item.width,
      height: item.height,
      jobName: item.jobName,
      additionalService: item.additionalService,
      orderNotes: item.orderNotes,
      productSize: item.productSize,
      customShape: item.customShape,
      productType: item.productType,
      fullName: item.fullName,
      business: item.business,
      phone: item.phone,
      email: item.email,
      quoteRequired: true,
      artworks: item.artworks.map((artwork) => ({
        fileName: artwork.fileName,
        contentType: artwork.contentType,
        data: artwork.data,
      })),
    }));
    const artworkBytes = (items: ICartItem[]) =>
      items.reduce(
        (total, item) =>
          total +
          item.artworks.reduce(
            (itemTotal, artwork) => itemTotal + artwork.data.length,
            0
          ),
        0
      );

    if (
      userCart.items.length + guestItems.length > MAX_CART_ITEMS ||
      artworkBytes(userCart.items) + artworkBytes(guestItems) >
        MAX_CART_ARTWORK_BYTES
    ) {
      throw new Error("CART_MERGE_LIMIT_EXCEEDED");
    }

    const result = await Cart.updateOne(
      {
        _id: userCart._id,
        $expr: {
          $lte: [
            { $add: [{ $size: "$items" }, guestItems.length] },
            MAX_CART_ITEMS,
          ],
        },
      },
      { $push: { items: { $each: guestItems } } }
    );

    if (!result.modifiedCount) {
      throw new Error("CART_MERGE_CONFLICT");
    }
  }

  await Cart.deleteOne({ _id: guestCart._id });
  cookieStore.delete(GUEST_CART_COOKIE);
}

export async function startGuestCart() {
  const cookieStore = await cookies();
  const guestId = randomBytes(32).toString("hex");

  cookieStore.set(GUEST_CART_COOKIE, guestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_CART_MAX_AGE,
  });
}

export async function addItemToCart(cart: ICart, owner: CartOwner, item: ICartItem) {
  const currentArtworkBytes = cart.items.reduce(
    (total, cartItem) =>
      total +
      cartItem.artworks.reduce(
        (itemTotal, artwork) => itemTotal + artwork.data.length,
        0
      ),
    0
  );
  const newArtworkBytes = item.artworks.reduce(
    (total, artwork) => total + artwork.data.length,
    0
  );

  if (cart.items.length >= MAX_CART_ITEMS) {
    throw new Error("CART_ITEM_LIMIT_EXCEEDED");
  }

  if (currentArtworkBytes + newArtworkBytes > MAX_CART_ARTWORK_BYTES) {
    throw new Error("CART_ARTWORK_LIMIT_EXCEEDED");
  }

  cart.items.push(item);
  refreshGuestCart(cart, owner);
  await cart.save();
}

export function cartErrorResponse(error: unknown) {
  if (error instanceof Error && error.message === "CART_ITEM_LIMIT_EXCEEDED") {
    return Response.json(
      { success: false, message: "Your cart has reached its item limit." },
      { status: 409 }
    );
  }

  if (
    error instanceof Error &&
    error.message === "CART_ARTWORK_LIMIT_EXCEEDED"
  ) {
    return Response.json(
      { success: false, message: "Your cart has reached its artwork storage limit." },
      { status: 413 }
    );
  }

  if (
    error instanceof Error &&
    (error.message === "CART_MERGE_LIMIT_EXCEEDED" ||
      error.message === "CART_MERGE_CONFLICT")
  ) {
    return Response.json(
      {
        success: false,
        message:
          "Your guest cart could not be merged because the account cart has reached its limit. Please remove some items and try again.",
      },
      { status: 409 }
    );
  }

  return null;
}
