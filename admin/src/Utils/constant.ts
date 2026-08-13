export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Uploaded files (coverImage, gallery, paymentScreenshot) are served from the
// backend's root (e.g. http://localhost:8000/uploads/...), not under /api.
export const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const getAssetUrl = (path?: string | null): string => {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${ASSET_BASE_URL}${path}`;
};

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard/home": "Home",
  "/dashboard/profile": "Profile",
  "/dashboard/campaigns": "Campaigns",
  "/dashboard/campaigns/create": "Create Campaign",
  "/dashboard/donations": "Donations",
  "/dashboard/payment-receiving": "Payment Receiving",
  "/dashboard/contact": "Messages",
};

export const getPageTitle = (pathname: string) => {
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname];
  }
  if (/^\/dashboard\/campaigns\/[^/]+\/edit$/.test(pathname)) {
    return "Edit Campaign";
  }
  if (/^\/dashboard\/campaigns\/[^/]+\/donations$/.test(pathname)) {
    return "Campaign Donations";
  }
  if (/^\/dashboard\/campaigns\/[^/]+$/.test(pathname)) {
    return "Campaign Details";
  }
  if (/^\/dashboard\/donations\/[^/]+$/.test(pathname)) {
    return "Donation Details";
  }
  return "Dashboard";
};
