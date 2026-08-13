const baseLayout = ({ heading, accentColor, bodyHtml }) => `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">
            <tr>
              <td style="background-color:${accentColor};padding:20px 28px;">
                <h1 style="margin:0;color:#ffffff;font-size:18px;">${heading}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;color:#27272a;font-size:14px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;background-color:#fafafa;color:#a1a1aa;font-size:12px;border-top:1px solid #e4e4e7;">
                This is an automated email. Please do not reply directly to this message.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const buildPasswordResetEmail = ({ name, resetLink }) => ({
  subject: "Reset your password",
  html: baseLayout({
    heading: "Password Reset Request",
    accentColor: "#2563eb",
    bodyHtml: `
      <p>Hi ${name},</p>
      <p>We received a request to reset the password for your admin account. Click the button below to choose a new password.</p>
      <p style="text-align:center;margin:28px 0;">
        <a href="${resetLink}" style="background-color:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;display:inline-block;">Reset Password</a>
      </p>
      <p>This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
      <p style="color:#71717a;font-size:12px;word-break:break-all;">If the button doesn't work, copy and paste this link into your browser:<br />${resetLink}</p>
    `,
  }),
});
