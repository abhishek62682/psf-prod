const formatAmount = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    amount
  );

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

const detailsTable = (rows) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-collapse:collapse;">
    ${rows
      .map(
        ([label, value]) => `
      <tr>
        <td style="padding:8px 0;color:#71717a;width:45%;border-bottom:1px solid #f0f0f0;">${label}</td>
        <td style="padding:8px 0;color:#18181b;font-weight:600;border-bottom:1px solid #f0f0f0;">${value}</td>
      </tr>`
      )
      .join("")}
  </table>
`;

export const buildDonationVerifiedEmail = ({ donorName, amount, campaignTitle, transactionId }) => ({
  subject: "Your donation has been verified",
  html: baseLayout({
    heading: "Donation Verified ✅",
    accentColor: "#16a34a",
    bodyHtml: `
      <p>Dear ${donorName},</p>
      <p>Thank you for your generosity. We're pleased to let you know that your donation has been <strong>successfully verified</strong>.</p>
      ${detailsTable([
        ["Donor Name", donorName],
        ["Amount", formatAmount(amount)],
        ["Campaign", campaignTitle],
        ["Transaction ID", transactionId],
        ["Status", "Verified"],
      ])}
      <p>Your support makes a real difference. Thank you for standing with us.</p>
    `,
  }),
});

export const buildDonationRejectedEmail = ({ donorName, amount, campaignTitle, transactionId, rejectionReason }) => ({
  subject: "Update on your donation submission",
  html: baseLayout({
    heading: "Donation Could Not Be Verified",
    accentColor: "#dc2626",
    bodyHtml: `
      <p>Dear ${donorName},</p>
      <p>We reviewed your donation submission but were unable to verify it.</p>
      ${detailsTable([
        ["Donor Name", donorName],
        ["Amount", formatAmount(amount)],
        ["Campaign", campaignTitle],
        ["Transaction ID", transactionId],
        ["Status", "Rejected"],
        ...(rejectionReason ? [["Reason", rejectionReason]] : []),
      ])}
      <p>If you believe this was a mistake or the payment did go through, you can submit your payment proof again using the same transaction ID along with a clearer screenshot.</p>
    `,
  }),
});
