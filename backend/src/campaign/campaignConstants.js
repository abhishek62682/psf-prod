export const CAMPAIGN_STATUSES = ["draft", "active", "paused", "completed"];
export const CAMPAIGN_MAX_DOCUMENTS = 6;

// Admin-only views on top of CAMPAIGN_STATUSES — not part of the schema enum.
export const CAMPAIGN_ADMIN_VIEWS = [...CAMPAIGN_STATUSES, "deleted", "all"];
