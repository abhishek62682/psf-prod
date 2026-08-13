import httpClient from "@/config/http/httpClient";

/* ================================
   Matches src/donation/* on the backend (public routes only — see
   ngo-backend-js/api.md). Admin-only endpoints are not used here.
================================ */

export interface PublicDonationCampaignRef {
  title: string;
  slug: string;
}

export interface PublicDonation {
  name: string;
  amount: number;
  date: string;
  campaign: PublicDonationCampaignRef | null;
}

export interface DonationStats {
  totalSupporters: number;
  totalRaised: number;
  totalCampaigns: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListDonationsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ListDonationsResult {
  stats: DonationStats;
  donations: PublicDonation[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// GET /api/donations/recents — latest N verified donations, newest first.
export const getRecentDonations = async (limit?: number): Promise<PublicDonation[]> => {
  const { data } = await httpClient.get<ApiResponse<PublicDonation[]>>("/donations/recents", {
    params: limit ? { limit } : undefined,
  });
  return data.data;
};

// GET /api/donations — verified donations platform-wide, paginated,
// searchable by donor or campaign name, plus overall stats.
export const listDonations = async (params: ListDonationsParams = {}): Promise<ListDonationsResult> => {
  const { data } = await httpClient.get<ApiResponse<ListDonationsResult>>("/donations", { params });
  return data.data;
};

export interface SubmitDonationPayload {
  campaignId: string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  transactionId: string;
  paymentDate: string;
  paymentScreenshot: File;
  message?: string;
  is80GApplicable?: boolean;
  // Required by the backend when is80GApplicable is true. Format:
  // 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).
  panNumber?: string;
}

// POST /api/donations (multipart/form-data) — public donation submission.
// Rejected with 409 if the campaign's goal is already met, or if the
// transaction ID is already pending/verified for this campaign (a
// previously-rejected transaction ID may be resubmitted).
export const submitDonation = async (payload: SubmitDonationPayload): Promise<void> => {
  const formData = new FormData();
  formData.append("campaignId", payload.campaignId);
  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("phone", payload.phone);
  formData.append("amount", String(payload.amount));
  formData.append("transactionId", payload.transactionId);
  formData.append("paymentDate", payload.paymentDate);
  formData.append("paymentScreenshot", payload.paymentScreenshot);
  if (payload.message) formData.append("message", payload.message);
  if (payload.is80GApplicable) {
    formData.append("is80GApplicable", "true");
    formData.append("panNumber", payload.panNumber ?? "");
  }

  await httpClient.post<ApiResponse<null>>("/donations", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
