import httpClient from "../http/httpClient";

/* ================================
   Matches src/dashboard/* on the backend exactly.
================================ */

export interface RecentDonorCampaignRef {
  _id: string;
  title: string;
  slug: string;
}

export interface RecentDonor {
  _id?: string;
  name: string;
  email?: string;
  amount: number;
  verifiedAt: string;
  campaignId: RecentDonorCampaignRef | null;
}

export interface StatsData {
  totalCampaigns: number;
  activeCampaigns: number;
  pendingDonations: number;
  verifiedDonations: number;
  totalDonationAmount: number;
  todayDonations: number;
  // Latest 5 verified donors, already embedded here — no separate call to
  // GET /api/dashboard/recent-donors needed for the dashboard home page.
  recentDonors: RecentDonor[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// GET /api/dashboard
export const getStats = async (): Promise<StatsData> => {
  const { data } = await httpClient.get<ApiResponse<StatsData>>("/dashboard");
  return data.data;
};
