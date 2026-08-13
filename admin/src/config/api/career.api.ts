import httpClient from "@/config/http/httpClient";
import type { CareerEmploymentType, CareerWorkMode, CareerStatus } from "@/config/careerConstants";

/* ================================
   Matches src/career/* on the backend exactly (see api.md).
================================ */

export interface Career {
  _id: string;
  title: string;
  employmentType: CareerEmploymentType;
  workMode: CareerWorkMode;
  location: string;
  description: string;
  experience: string;
  qualification: string;
  status: CareerStatus;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CareerFormPayload {
  title: string;
  employmentType: CareerEmploymentType;
  workMode: CareerWorkMode;
  location: string;
  description: string;
  experience: string;
  qualification: string;
  status?: CareerStatus;
}

/* ---------- Public ---------- */

export const listCareers = async (): Promise<Career[]> => {
  const { data } = await httpClient.get<ApiResponse<Career[]>>("careers");
  return data.data;
};

/* ---------- Admin (requires auth) ---------- */

// GET /api/careers/admin — every non-deleted posting, any status.
export const adminListCareers = async (): Promise<Career[]> => {
  const { data } = await httpClient.get<ApiResponse<Career[]>>("careers/admin");
  return data.data;
};

export const getCareerById = async (id: string): Promise<Career> => {
  const { data } = await httpClient.get<ApiResponse<Career>>(`careers/${id}`);
  return data.data;
};

export const createCareer = async (payload: CareerFormPayload): Promise<Career> => {
  const { data } = await httpClient.post<ApiResponse<Career>>("careers", payload);
  return data.data;
};

// PATCH — also how status is toggled (updateCareer(id, { status: "closed" })).
export const updateCareer = async (id: string, payload: Partial<CareerFormPayload>): Promise<Career> => {
  const { data } = await httpClient.patch<ApiResponse<Career>>(`careers/${id}`, payload);
  return data.data;
};

export const deleteCareer = async (id: string): Promise<void> => {
  await httpClient.delete(`careers/${id}`);
};
