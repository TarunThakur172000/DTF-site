import "server-only";

import type { ICartArtwork } from "@/models/Cart";

export interface WordPressMediaUpload {
  fileName: string;
  url: string;
}

export async function uploadWordPressMedia(
  artwork: ICartArtwork,
  filePrefix: string
): Promise<WordPressMediaUpload> {
  const baseUrl = process.env.WOOCOMMERCE_BASE_URL;
  const username = process.env.WORDPRESS_USERNAME;
  const applicationPassword = process.env.WORDPRESS_APP_PASSWORD;
  if (!baseUrl || !username || !applicationPassword) {
    throw new Error(
      "WOOCOMMERCE_BASE_URL, WORDPRESS_USERNAME, and WORDPRESS_APP_PASSWORD must be configured"
    );
  }

  const storeUrl = new URL(baseUrl);
  const isLocalDevelopment =
    process.env.NODE_ENV !== "production" &&
    ["localhost", "127.0.0.1", "::1"].includes(storeUrl.hostname);
  if (storeUrl.protocol !== "https:" && !isLocalDevelopment) {
    throw new Error("WordPress media uploads require HTTPS");
  }

  const mediaUrl = new URL(
    `${storeUrl.pathname.replace(/\/+$/, "")}/wp-json/wp/v2/media`,
    storeUrl.origin
  );
  const originalName = artwork.fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-100);
  const fileName = `${filePrefix}-${originalName || "artwork"}`.slice(0, 180);
  const credentials = Buffer.from(
    `${username}:${applicationPassword.replace(/\s+/g, "")}`
  ).toString("base64");
  const bytes = new Uint8Array(artwork.data.byteLength);
  bytes.set(artwork.data);

  const response = await fetch(mediaUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${credentials}`,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": artwork.contentType,
    },
    body: bytes.buffer,
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`WordPress media upload returned invalid JSON (${response.status})`);
  }

  if (!response.ok) {
    const code =
      typeof payload === "object" &&
      payload !== null &&
      "code" in payload &&
      typeof payload.code === "string"
        ? payload.code
        : "unknown_error";
    console.error("WordPress media upload failed", {
      status: response.status,
      code,
    });
    throw new Error(`WordPress media upload failed (${response.status})`);
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("source_url" in payload) ||
    typeof payload.source_url !== "string"
  ) {
    throw new Error("WordPress media upload returned an invalid response");
  }

  const uploadedUrl = new URL(payload.source_url);
  if (
    (uploadedUrl.protocol !== "https:" &&
      !(isLocalDevelopment && uploadedUrl.protocol === "http:")) ||
    uploadedUrl.username ||
    uploadedUrl.password
  ) {
    throw new Error("WordPress returned an insecure artwork URL");
  }

  return { fileName: originalName || "artwork", url: uploadedUrl.toString() };
}
