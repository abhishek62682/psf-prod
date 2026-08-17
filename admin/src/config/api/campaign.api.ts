import httpClient from "@/config/http/httpClient";
import type { CampaignStatus, CampaignAdminView } from "@/config/campaignConstants";

/* ================================
   Matches src/campaign/* on the backend exactly (see api.md / api-test.md).
================================ */

export interface CampaignDocument {
  url: string;
  label: string;
}

export interface Campaign {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  totalDonors: number;
  coverImage: string;
  gallery: string[];
  documents?: CampaignDocument[];
  startDate: string;
  endDate: string;
  isFeatured: boolean;
  status: CampaignStatus;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

// What GET /api/campaigns (list) and GET /api/campaigns/:id both add on top.
// The list and the single-campaign responses are the same shape — the
// backend never nests payment/donor info here, use the dedicated endpoints
// below for those.
export interface CampaignWithProgress extends Campaign {
  progress: number;
}

// What GET /api/campaigns/admin adds on top of Campaign — progress and each
// campaign's donation counts by status, grouped under `meta`.
export interface CampaignMeta {
  progress: number;
  totalDonations: number;
  pendingDonations: number;
  verifiedDonations: number;
  rejectedDonations: number;
}

export interface CampaignWithDonationStats extends Campaign {
  meta: CampaignMeta;
}

export interface CampaignOption {
  _id: string;
  title: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CampaignFormPayload {
  title: string;
  slug?: string;
  shortDescription: string;
  description: string;
  goalAmount: number;
  coverImage?: string;
  gallery?: string[];
  documents?: CampaignDocument[];
  startDate: string;
  endDate: string;
  isFeatured?: boolean;
  status?: CampaignStatus;
  // Optional — the backend auto-attaches the default payment receiving
  // account when this is omitted. Only relevant once the UI supports
  // choosing between multiple accounts.
  paymentReceivingAccountId?: string;
}

export interface ListCampaignsParams {
  page?: number;
  limit?: number;
  search?: string;
  featured?: boolean;
  status?: CampaignStatus;
}

/* ---------- Public ---------- */

export const listCampaigns = async (
  params: ListCampaignsParams = {}
): Promise<{ campaigns: CampaignWithProgress[]; pagination: Pagination }> => {
  const { data } = await httpClient.get<
    ApiResponse<{ campaigns: CampaignWithProgress[]; pagination: Pagination }>
  >("campaigns", { params });
  return data.data;
};

export const getCampaignById = async (id: string): Promise<CampaignWithProgress> => {
  const { data } = await httpClient.get<ApiResponse<CampaignWithProgress>>(`campaigns/${id}`);
  return data.data;
};

// Note: GET /api/campaigns/:id/donations exists on the backend (public,
// verified-only — built for a future donor-facing site) but isn't used
// here. This admin panel's "View Donations" instead calls
// adminListDonations({ campaignId }) from donation.api.ts, which is
// richer (every status, plus a stats breakdown) and admin-only.

// GET /api/campaigns/options — minimal {_id, title} list for dropdowns.
export const getCampaignOptions = async (
  params: { status?: CampaignStatus } = {}
): Promise<CampaignOption[]> => {
  const { data } = await httpClient.get<ApiResponse<CampaignOption[]>>("campaigns/options", {
    params,
  });
  return data.data;
};

/* ---------- Admin (requires auth) ---------- */

// GET /api/campaigns/admin — active by default; `status` also accepts
// "deleted" and "all" (CampaignAdminView).
export const adminListCampaigns = async (
  params: { page?: number; limit?: number; search?: string; status?: CampaignAdminView } = {}
): Promise<{ campaigns: CampaignWithDonationStats[]; pagination: Pagination }> => {
  const { data } = await httpClient.get<
    ApiResponse<{ campaigns: CampaignWithDonationStats[]; pagination: Pagination }>
  >("campaigns/admin", { params });
  return data.data;
};

export const createCampaign = async (payload: CampaignFormPayload): Promise<Campaign> => {
  const { data } = await httpClient.post<ApiResponse<Campaign>>("campaigns", payload);
  return data.data;
};

// PATCH, not PUT — this is also how status changes are made now
// (updateCampaign(id, { status: "paused" })), there's no separate route.
export const updateCampaign = async (
  id: string,
  payload: Partial<CampaignFormPayload>
): Promise<Campaign> => {
  const { data } = await httpClient.patch<ApiResponse<Campaign>>(`campaigns/${id}`, payload);
  return data.data;
};

export const deleteCampaign = async (id: string): Promise<void> => {
  await httpClient.delete(`campaigns/${id}`);
};
