import httpClient from "@/config/http/httpClient";

/* ================================
   Matches src/upload/* on the backend exactly.
   Both endpoints require auth (mounted behind authenticate in uploadRouter.js).
   thumbnail/gallery/event are reachable here — screenshot (donations) and
   profile (avatar, see profile.api.ts's uploadAvatar) are forced server-side
   on their own dedicated routes, not selectable through this generic one.
   There is no "misc" fallback anymore. qrcode is not an uploadable type —
   the payment QR is a static file dropped into public/uploads/qrcode/.
================================ */

export type UploadType = "thumbnail" | "gallery" | "event";

// Document (PDF) uploads — separate whitelist from UploadType above,
// matches ALLOWED_DOCUMENT_TYPES in backend/src/middlewares/upload.js.
export type DocumentUploadType = "event" | "campaign";

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

export const uploadDocuments = async (
  files: File[],
  type: DocumentUploadType
): Promise<{ urls: string[]; type: string; count: number }> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("documents", file));

  const { data } = await httpClient.post<ApiResponse<{ urls: string[]; type: string; count: number }>>(
    `uploads/documents?type=${type}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
};
