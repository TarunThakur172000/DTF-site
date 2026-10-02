import {
  escapeEmailHtml,
  sendAdminEmail,
} from "@/lib/server/email/mailer";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "Invalid contact request." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json(
      { success: false, message: "Invalid contact request." },
      { status: 400 }
    );
  }

  const values = body as Record<string, unknown>;
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const email = typeof values.email === "string" ? values.email.trim() : "";
  const message = typeof values.message === "string" ? values.message.trim() : "";

  if (
    !name ||
    name.length > 120 ||
    !EMAIL_PATTERN.test(email) ||
    email.length > 254 ||
    !message ||
    message.length > 5000
  ) {
    return Response.json(
      { success: false, message: "Please provide a valid name, email, and message." },
      { status: 400 }
    );
  }

  const safeName = escapeEmailHtml(name);
  const safeEmail = escapeEmailHtml(email);
  const safeMessage = escapeEmailHtml(message).replace(/\n/g, "<br>");
  const subjectName = name.replace(/[\r\n]+/g, " ");

  try {
    await sendAdminEmail({
      replyTo: email,
      subject: `New Inquiry: Website message from ${subjectName}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:32px;background:#f4f4f7;font-family:Arial,sans-serif;color:#1a1a1a">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden">
              <tr>
                <td style="padding:28px 32px;background:#0f172a;color:#fff">
                  <p style="margin:0 0 6px;color:#38bdf8;font-size:12px;font-weight:bold">PRINT PRESS REPEAT</p>
                  <h1 style="margin:0;font-size:22px">New Website Inquiry</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px">
                  <p style="margin:0 0 20px;color:#475569">A visitor sent a message through the contact form.</p>
                  <p style="margin:0 0 12px"><strong>Name:</strong> ${safeName}</p>
                  <p style="margin:0 0 24px"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
                  <p style="margin:0 0 8px;font-size:12px;font-weight:bold;text-transform:uppercase;color:#64748b">Message</p>
                  <div style="padding:18px;border:1px solid #e2e8f0;border-left:4px solid #2563eb;line-height:1.6;color:#334155">${safeMessage}</div>
                  <p style="margin:24px 0 0"><a href="mailto:${safeEmail}?subject=Re%3A%20Your%20inquiry%20on%20Print%20Press%20Repeat" style="display:inline-block;padding:11px 18px;border-radius:6px;background:#2563eb;color:#fff;text-decoration:none;font-weight:bold">Reply to Sender</a></p>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#64748b">Sent from the Print Press Repeat website.</td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("CONTACT_SUBMISSION_ERROR:", error);
    return Response.json(
      { success: false, message: "Unable to send your message right now." },
      { status: 500 }
    );
  }
}