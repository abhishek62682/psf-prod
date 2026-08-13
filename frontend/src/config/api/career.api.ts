import httpClient from "@/config/http/httpClient";

/* ================================
   Matches src/career/* on the backend (public route only — see
   ngo-backend-js/api.md). Admin-only endpoints are not used here.
================================ */

export type CareerEmploymentType = "full-time" | "part-time" | "internship";
export type CareerWorkMode = "on-site" | "hybrid" | "remote";

export interface Career {
  _id: string;
  title: string;
  employmentType: CareerEmploymentType;
  workMode: CareerWorkMode;
  location: string;
  description: string;
  experience: string;
  qualification: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// GET /api/careers — active postings only (backend default), newest first.
export const listCareers = async (): Promise<Career[]> => {
  const { data } = await httpClient.get<ApiResponse<Career[]>>("/careers");
  return data.data;
};
