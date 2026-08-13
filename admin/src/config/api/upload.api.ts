import httpClient from "@/config/http/httpClient";

/* ================================
   Matches src/upload/* on the backend exactly.
   Both endpoints require auth (mounted behind authenticate in uploadRouter.js).
   thumbnail/gallery/qrcode are reachable here — screenshot (donations) and
   profile (avatar, see profile.api.ts's uploadAvatar) are forced server-side
   on their own dedicated routes, not selectable through this generic one.
   There is no "misc" fallback anymore.
================================ */

export type UploadType = "thumbnail" | "gallery" | "qrcode";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const uploadImage = async (file: File, type: UploadType): Promise<{ url: string; type: string }> => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await httpClient.post<ApiResponse<{ url: string; type: string }>>(
    `uploads/image?type=${type}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
};

export const uploadImages = async (
  files: File[],
  type: UploadType
): Promise<{ urls: string[]; type: string; count: number }> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const { data } = await httpClient.post<ApiResponse<{ urls: string[]; type: string; count: number }>>(
    `uploads/images?type=${type}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
};
