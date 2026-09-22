import "server-only";

import { sendEmail } from "./mailer";

export async function sendVerificationCode(
  email: string,
  fullName: string,
  otp: string
) {
  await sendEmail({
    to: email,

    subject: "Verify your email address",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px;
      ">

        <h2>Verify your email</h2>

        <p>Hello ${fullName},</p>

        <p>
          Thank you for creating an account.
          Please use the verification code below:
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
          This verification code will expire in 10 minutes.
        </p>

        <p>
          If you did not create this account, you can safely
          ignore this email.
        </p>

      </div>
    `,

    text: `
Hello ${fullName},

Thank you for creating an account.

Your verification code is: ${otp}

This verification code will expire in 10 minutes.

If you did not create this account, you can safely ignore this email.
    `,
  });
}