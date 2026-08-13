import httpClient from "@/config/http/httpClient";
import type { UserRole } from "@/config/roles";

/* ================================
   Matches src/admin/profileController.js exactly. GET/PUT return the full
   Mongo admin document under `data` (password/otpSecret excluded server-side
   via select:false, so they never appear here).
================================ */

export interface Profile {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// GET /api/profile
export const getProfile = async (): Promise<Profile> => {
  const { data } = await httpClient.get<ApiResponse<Profile>>("profile");
  return data.data;
};

// PUT /api/profile — plain JSON, not multipart. Upload the avatar file via
// uploadImage() first (upload.api.ts) and pass the returned URL here.
export const updateProfile = async (payload: UpdateProfilePayload): Promise<Profile> => {
  const { data } = await httpClient.put<ApiResponse<Profile>>("profile", payload);
  return data.data;
};

// PUT /api/profile/password — no data payload on success, just a message.
export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  await httpClient.put("profile/password", payload);
};

// POST /api/profile/avatar — multipart, field "avatar". Uploads AND sets the
// authenticated admin's avatar in one call (no separate "apply on save" step
// on the backend side).
export const uploadAvatar = async (file: File): Promise<{ avatar: string }> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await httpClient.post<ApiResponse<{ avatar: string }>>(
    "profile/avatar",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
};
