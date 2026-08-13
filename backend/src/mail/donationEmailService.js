import { sendMail } from "./mailService.js";
import { buildDonationVerifiedEmail, buildDonationRejectedEmail } from "./donationEmailTemplates.js";

// donation: populated donation doc (needs campaignId.title). Fire-and-log —
// callers must not let a failure here affect the donation's saved status.
export const sendDonationVerifiedEmail = async (donation) => {
  const { subject, html } = buildDonationVerifiedEmail({
    donorName: donation.name,
    amount: donation.amount,
    campaignTitle: donation.campaignId?.title || "the campaign",
    transactionId: donation.transactionId,
  });

  return sendMail({ to: donation.email, subject, html });
};

export const sendDonationRejectedEmail = async (donation) => {
  const { subject, html } = buildDonationRejectedEmail({
    donorName: donation.name,
    amount: donation.amount,
    campaignTitle: donation.campaignId?.title || "the campaign",
    transactionId: donation.transactionId,
    rejectionReason: donation.rejectionReason,
  });

  return sendMail({ to: donation.email, subject, html });
};
