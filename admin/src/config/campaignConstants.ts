// Mirrors src/campaign/campaignConstants.js on the backend.
// "archived" is not a campaign status — soft-delete (isDeleted) is the
// admin action for archiving; it no longer appears here.
export const CAMPAIGN_STATUSES = ["draft", "active", "paused", "completed"] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
};

export const CAMPAIGN_STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  active: "bg-green-50 text-green-700 border-green-200",
  paused: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
};

// Admin-only listing views on top of CAMPAIGN_STATUSES — not real statuses.
export const CAMPAIGN_ADMIN_VIEWS = [...CAMPAIGN_STATUSES, "deleted", "all"] as const;

export type CampaignAdminView = (typeof CAMPAIGN_ADMIN_VIEWS)[number];

export const CAMPAIGN_ADMIN_VIEW_LABELS: Record<CampaignAdminView, string> = {
  ...CAMPAIGN_STATUS_LABELS,
  deleted: "Deleted",
  all: "All",
};

export const CAMPAIGN_ADMIN_VIEW_STYLES: Record<CampaignAdminView, string> = {
  ...CAMPAIGN_STATUS_STYLES,
  deleted: "bg-red-50 text-red-700 border-red-200",
  all: "bg-slate-100 text-slate-600 border-slate-200",
};
