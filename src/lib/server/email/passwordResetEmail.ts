import "server-only";

import { sendEmail } from "./mailer";

export async function sendPasswordResetCode(
  email: string,
  fullName: string,
  otp: string
) {
  await sendEmail({
    to: email,

    subject: "Reset your password",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px;
      ">
        <h2>Reset your password</h2>

        <p>Hello ${fullName},</p>

        <p>
          We received a request to reset your password.
          Use the verification code below:
        </p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 25px 0;
        ">
          ${otp}
        </div>

        <p>
          This code will expire in 10 minutes.
        </p>

        <p>
          If you did not request a password reset,
          you can safely ignore this email.
        </p>
      </div>
    `,

    text: `
Hello ${fullName},

We received a request to reset your password.

Your password reset code is: ${otp}

This code will expire in 10 minutes.

If you did not request a password reset,
you can safely ignore this email.
    `,
  });
}