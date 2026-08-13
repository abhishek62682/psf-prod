// Mirrors src/contact/contactConstants.js on the backend.
export const CONTACT_STATUSES = ["new", "read", "responded"] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  new: "New",
  read: "Read",
  responded: "Responded",
};

export const CONTACT_STATUS_STYLES: Record<ContactStatus, string> = {
  new: "bg-amber-50 text-amber-700 border-amber-200",
  read: "bg-blue-50 text-blue-700 border-blue-200",
  responded: "bg-green-50 text-green-700 border-green-200",
};

export const CONTACT_INTERESTS = ["volunteer", "partner", "career"] as const;

export type ContactInterest = (typeof CONTACT_INTERESTS)[number];

export const CONTACT_INTEREST_LABELS: Record<ContactInterest, string> = {
  volunteer: "Become a Volunteer",
  partner: "Partner With Us",
  career: "Career Opportunities",
};
