    import "server-only";

import nodemailer, { type SendMailOptions } from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const emailFrom = process.env.EMAIL_FROM;

if (!smtpHost || !smtpUser || !smtpPassword || !emailFrom) {
  throw new Error("SMTP environment variables are not configured");
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPassword,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: SendMailOptions["attachments"];
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  attachments,
}: SendEmailOptions) {
  return transporter.sendMail({
    from: emailFrom,
    to,
    subject,
    html,
    text,
    replyTo,
    attachments,
  });
}

export async function sendAdminEmail(
  options: Omit<SendEmailOptions, "to">
) {
  const to = process.env.ADMIN_EMAIL?.trim() || smtpUser;

  if (!to) {
    throw new Error("ADMIN_EMAIL or SMTP_USER must be configured");
  }

  return sendEmail({ ...options, to });
}

export function escapeEmailHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}