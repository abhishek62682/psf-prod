// Mirrors src/donation/donationConstants.js on the backend.
export const DONATION_STATUSES = ["pending", "verified", "rejected"] as const;

export type DonationStatus = (typeof DONATION_STATUSES)[number];

export const DONATION_STATUS_LABELS: Record<DonationStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

export const DONATION_STATUS_STYLES: Record<DonationStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  verified: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};
