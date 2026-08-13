export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Uploaded files (qrCode, paymentScreenshot, etc.) are served from the
// backend's root (e.g. http://localhost:8000/uploads/...), not under /api.
export const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const getAssetUrl = (path?: string | null): string => {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${ASSET_BASE_URL}${path}`;
};
