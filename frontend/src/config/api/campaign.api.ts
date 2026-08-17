import httpClient from "@/config/http/httpClient";

/* ================================
   Matches src/campaign/* on the backend (public routes only — see
   ngo-backend-js/api.md). Admin-only endpoints are not used here.
================================ */

export interface CampaignOption {
  _id: string;
  title: string;
}

export interface CampaignDocument {
  url: string;
  label: string;
}

export interface Campaign {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  goalAmount: number;
  raisedAmount: number;
  totalDonors: number;
  coverImage: string;
  gallery: string[];
  documents?: CampaignDocument[];
  startDate: string;
  endDate: string;
  isFeatured: boolean;
  status: "draft" | "active" | "paused" | "completed";
  progress: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListCampaignsParams {
  page?: number;
  limit?: number;
  search?: string;
  featured?: boolean;
}

export interface ListCampaignsResult {
  campaigns: Campaign[];
  pagination: Pagination;
}

// GET /api/campaigns/:id includes the full description, which the list
// endpoint omits.
export interface CampaignDetail extends Campaign {
  description: string;
}

export interface CampaignDonation {
  name: string;
  amount: number;
  date: string;
}

export interface ListCampaignDonationsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListCampaignDonationsResult {
  donations: CampaignDonation[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// GET /api/campaigns — active campaigns only (backend default), sorted
// featured-first. No filters/search applied unless explicitly passed.
export const listCampaigns = async (params: ListCampaignsParams = {}): Promise<ListCampaignsResult> => {
  const { data } = await httpClient.get<ApiResponse<ListCampaignsResult>>("/campaigns", { params });
  return data.data;
};

// GET /api/campaigns/options — minimal {_id, title} list for dropdowns.
// Active campaigns only (backend default).
export const getCampaignOptions = async (): Promise<CampaignOption[]> => {
  const { data } = await httpClient.get<ApiResponse<CampaignOption[]>>("/campaigns/options");
  return data.data;
};

// GET /api/campaigns/:id — one campaign's full details (no payment
// account, no donor list — see getCampaignDonations for those).
export const getCampaignById = async (id: string): Promise<CampaignDetail> => {
  const { data } = await httpClient.get<ApiResponse<CampaignDetail>>(`/campaigns/${id}`);
  return data.data;
};

// GET /api/campaigns/:id/donations — verified donations for one campaign,
// paginated, searchable by donor name.
export const getCampaignDonations = async (
  id: string,
  params: ListCampaignDonationsParams = {}
): Promise<ListCampaignDonationsResult> => {
  const { data } = await httpClient.get<ApiResponse<ListCampaignDonationsResult>>(`/campaigns/${id}/donations`, {
    params,
  });
  return data.data;
};
