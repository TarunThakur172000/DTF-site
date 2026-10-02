import {
  escapeEmailHtml,
  sendAdminEmail,
} from "@/lib/server/email/mailer";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_REQUEST_SIZE = 12 * 1024 * 1024;
const MAX_TOTAL_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 3;
const ALLOWED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".pdf",
  ".svg",
  ".ai",
  ".eps",
]);

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_REQUEST_SIZE) {
      return Response.json(
        { success: false, message: "The request is too large. Please use smaller artwork files." },
        { status: 413 }
      );
    }

    const formData = await request.formData();
    const fields = {
      name: readField(formData, "name"),
      business: readField(formData, "business"),
      email: readField(formData, "email"),
      phone: readField(formData, "phone"),
      quantity: readField(formData, "quantity"),
      productType: readField(formData, "productType"),
      size: readField(formData, "size"),
      customSize: readField(formData, "customSize"),
      shape: readField(formData, "shape"),
      customShape: readField(formData, "customShape"),
      notes: readField(formData, "notes"),
    };

    if (
      !fields.name || fields.name.length > 120 ||
      !EMAIL_PATTERN.test(fields.email) || fields.email.length > 254 ||
      !fields.quantity || fields.quantity.length > 40 ||
      !fields.productType || fields.productType.length > 200 ||
      fields.business.length > 120 || fields.phone.length > 50 ||
      fields.size.length > 100 || fields.customSize.length > 100 ||
      fields.shape.length > 100 || fields.customShape.length > 200 ||
      fields.notes.length > 5000
    ) {
      return Response.json(
        { success: false, message: "Please check the required quote fields and try again." },
        { status: 400 }
      );
    }

    const productType = fields.productType.toLowerCase();
    const needsSize = productType.includes("banner") || productType.includes("magnets");
    if (
      (needsSize && !fields.size) ||
      (fields.size === "Custom Size" && !fields.customSize) ||
      (productType.includes("magnets") && !fields.shape) ||
      (fields.shape === "Custom Shape" && !fields.customShape)
    ) {
      return Response.json(
        { success: false, message: "Please complete the selected product's size and shape details." },
        { status: 400 }
      );
    }

    const files = formData
      .getAll("artwork")
      .filter((value): value is File => value instanceof File && value.size > 0);

    if (files.length > MAX_FILES || files.some((file) => {
      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      return !ALLOWED_EXTENSIONS.has(extension);
    })) {
      return Response.json(
        { success: false, message: "Artwork must be PNG, JPG, PDF, SVG, AI, or EPS (up to 3 files)." },
        { status: 400 }
      );
    }

    const totalFileSize = files.reduce((total, file) => total + file.size, 0);
    if (totalFileSize > MAX_TOTAL_FILE_SIZE) {
      return Response.json(
        { success: false, message: "Artwork attachments must total 10 MB or less." },
        { status: 413 }
      );
    }

    const safeFields = Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [key, escapeEmailHtml(value)])
    );

    const text = Object.entries(fields)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    // Format human-friendly labels for quote attributes
    const fieldLabels: Record<string, string> = {
      name: "Contact Name",
      business: "Business Name",
      email: "Email Address",
      phone: "Phone Number",
      quantity: "Quantity",
      productType: "Product Type",
      size: "Size",
      customSize: "Custom Size",
      shape: "Shape",
      customShape: "Custom Shape",
      notes: "Additional Notes",
    };

    // Construct a styled key-value grid row loop
    const detailRows = Object.entries(safeFields)
      .filter(([, value]) => value)
      .map(([key, value]) => {
        const label = fieldLabels[key] || key;
        return `
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; width: 35%; font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: top;">
              ${label}
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; width: 65%; font-size: 15px; color: #0f172a; vertical-align: top;">
              ${key === "email" ? `<a href="mailto:${value}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${value}</a>` : value.replace(/\n/g, "<br>")}
            </td>
          </tr>
        `;
      })
      .join("");

    const fileCountText = files.length > 0 
      ? `${files.length} artwork file(s) attached to this email.`
      : "No artwork files attached.";

    await sendAdminEmail({
      replyTo: fields.email,
      subject: `New Quote Request: ${fields.productType} (${fields.quantity}) from ${fields.name.replace(/[\r\n]+/g, " ")}`,
      text,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Quote Request</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f7; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #eaeaea;">
                    
                    <!-- Header Banner -->
                    <tr>
                      <td style="background-color: #0f172a; padding: 32px 40px; text-align: left;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #38bdf8; font-weight: 700; display: block; margin-bottom: 6px;">Print · Press · Repeat</span>
                        <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; line-height: 1.3;">New Custom Quote Request</h1>
                      </td>
                    </tr>

                    <!-- Main Content Body -->
                    <tr>
                      <td style="padding: 40px;">
                        <p style="margin-top: 0; margin-bottom: 24px; font-size: 15px; color: #4b5563; line-height: 1.5;">
                          A new print quote request has been submitted through your website order pipeline. Full specifications are listed below:
                        </p>

                        <!-- Specifications Data Table -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px; overflow: hidden;">
                          ${detailRows}
                        </table>

                        <!-- Attachments Notice Box -->
                        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 6px; margin-bottom: 32px;">
                          <span style="font-size: 13px; font-weight: 600; color: #1e40af; display: block; margin-bottom: 2px;">Artwork Status</span>
                          <span style="font-size: 14px; color: #1e3a8a;">${fileCountText}</span>
                        </div>

                        <!-- Action Button -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 10px;">
                          <tr>
                            <td style="border-radius: 6px; background-color: #2563eb;">
                              <a href="mailto:${safeFields.email}?subject=Re: Your quote request for ${safeFields.productType} on Print Press Repeat" target="_blank" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; border: 1px solid #2563eb; display: inline-block;">Reply to Client</a>
                            </td>
                          </tr>
                        </table>

                      </td>
                    </tr>

                    <!-- Footer Info -->
                    <tr>
                      <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #eaeaea;">
                        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                          This quote notification was automatically generated from your custom printing backend.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      attachments: await Promise.all(files.map(async (file) => ({
        filename: file.name.replace(/[\r\n]/g, "_"),
        content: Buffer.from(await file.arrayBuffer()),
        contentType: file.type || "application/octet-stream",
      }))),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("QUOTE_SUBMISSION_ERROR:", error);
    return Response.json(
      { success: false, message: "Unable to send your quote request right now." },
      { status: 500 }
    );
  }
}