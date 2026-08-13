import httpClient from "@/config/http/httpClient";

/* ================================
   Matches src/contact/* on the backend (public route only — see
   ngo-backend-js/api.md). Admin-only endpoints are not used here.
================================ */

export type ContactInterest = "volunteer" | "partner" | "career";

export interface SubmitContactPayload {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  interest?: ContactInterest;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// POST /api/contact — public contact form submission.
export const submitContact = async (payload: SubmitContactPayload): Promise<void> => {
  await httpClient.post<ApiResponse<null>>("/contact", payload);
};
