import httpClient from "@/config/http/httpClient";
import type { DonationStatus } from "@/config/donationConstants";

/* ================================
   Matches src/donation/* on the backend exactly (see api.md / api-test.md).
   GET /api/donations (public, verified-only + stats) and
   GET /api/donations/recents (public) are distinct from the admin routes
   below, which all require auth and live under /api/donations/admin/...
================================ */

export interface DonationCampaignRef {
  _id: string;
  title: string;
  slug: string;
  goalAmount?: number;
  raisedAmount?: number;
  status?: string;
}

export interface AdminRef {
  _id: string;
  name: string;
  email: string;
}

export interface AuditLogEntry {
  action: string;
  performedBy?: AdminRef | string | null;
  remarks?: string;
  timestamp: string;
}

export interface Donation {
  _id: string;
  campaignId: DonationCampaignRef | string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  transactionId: string;
  paymentDate: string;
  message?: string;
  paymentScreenshot: string;
  is80GApplicable: boolean;
  panNumber?: string;
  status: DonationStatus;
  verifiedBy?: AdminRef | string | null;
  verifiedAt?: string;
  remarks?: string;
  rejectionReason?: string;
  auditLog: AuditLogEntry[];
  createdAt: string;
  updatedAt: string;
}

// Shape returned by the public donation feeds (GET /api/donations,
// GET /api/donations/recents) — donor-safe fields only.
export interface PublicDonation {
  name: string;
  amount: number;
  date: string;
  campaign: { title: string; slug: string } | null;
}

export interface DonationStats {
  totalSupporters: number;
  totalRaised: number;
  totalCampaigns: number;
}

// Returned by GET /api/donations/admin only when ?campaignId= is given —
// that campaign's status breakdown, independent of the status/search
// filters applied to the paginated list in the same response.
export interface CampaignDonationStats {
  pending: number;
  verified: number;
  rejected: number;
  total: number;
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

export interface ListDonationsParams {
  status?: DonationStatus;
  campaignId?: string;
  search?: string;
  page?: number;
  limit?: number;
  is80GApplicable?: boolean;
}

/* ---------- Public ---------- */

// GET /api/donations — verified donations platform-wide + overall stats.
// Not wired into a page yet in this admin panel, but kept here matching the
// backend contract for later reuse.
export const listDonations = async (
  params: { search?: string; page?: number; limit?: number } = {}
): Promise<{ stats: DonationStats; donations: PublicDonation[]; pagination: Pagination }> => {
  const { data } = await httpClient.get<
    ApiResponse<{ stats: DonationStats; donations: PublicDonation[]; pagination: Pagination }>
  >("donations", { params });
  return data.data;
};

// GET /api/donations/recents — latest 30 verified donations, newest first.
export const getRecentDonations = async (limit?: number): Promise<PublicDonation[]> => {
  const { data } = await httpClient.get<ApiResponse<PublicDonation[]>>("donations/recents", {
    params: limit ? { limit } : undefined,
  });
  return data.data;
};

/* ---------- Admin (requires auth) ---------- */

// GET /api/donations/admin — `stats` is only present when `campaignId` was
// passed in params.
export const adminListDonations = async (
  params: ListDonationsParams = {}
): Promise<{ donations: Donation[]; pagination: Pagination; stats?: CampaignDonationStats }> => {
  const { data } = await httpClient.get<
    ApiResponse<{ donations: Donation[]; pagination: Pagination; stats?: CampaignDonationStats }>
  >("donations/admin", { params });
  return data.data;
};

// GET /api/donations/:id
export const adminGetDonation = async (id: string): Promise<Donation> => {
  const { data } = await httpClient.get<ApiResponse<Donation>>(`donations/${id}`);
  return data.data;
};

// PATCH /api/donations/:id/verify
export const verifyDonation = async (id: string, remarks?: string): Promise<Donation> => {
  const { data } = await httpClient.patch<ApiResponse<Donation>>(`donations/${id}/verify`, { remarks });
  return data.data;
};

// PATCH /api/donations/:id/reject
export const rejectDonation = async (id: string, reason: string): Promise<Donation> => {
  const { data } = await httpClient.patch<ApiResponse<Donation>>(`donations/${id}/reject`, { reason });
  return data.data;
};
