import httpClient from "@/config/http/httpClient";
import type { ContactStatus, ContactInterest } from "@/config/contactConstants";

/* ================================
   Matches src/contact/* on the backend exactly. The public POST /api/contact
   (form submission) isn't needed here — this admin panel only manages
   messages that have already been submitted.
================================ */

export interface ContactMessage {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  interest?: ContactInterest;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
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

export interface ListContactMessagesParams {
  status?: ContactStatus;
  interest?: ContactInterest;
  search?: string;
  page?: number;
  limit?: number;
}

// GET /api/contact (admin)
export const listContactMessages = async (
  params: ListContactMessagesParams = {}
): Promise<{ messages: ContactMessage[]; pagination: Pagination }> => {
  const { data } = await httpClient.get<
    ApiResponse<{ messages: ContactMessage[]; pagination: Pagination }>
  >("contact", { params });
  return data.data;
};

// Note: GET /api/contact/:id exists on the backend but isn't used here —
// the message list already returns full message bodies, and "View" opens
// a sidebar straight off the row data instead of a separate page/fetch.

// PATCH /api/contact/:id (admin) — triage: new -> read -> responded
export const updateContactStatus = async (
  id: string,
  status: ContactStatus
): Promise<ContactMessage> => {
  const { data } = await httpClient.patch<ApiResponse<ContactMessage>>(`contact/${id}`, { status });
  return data.data;
};

// DELETE /api/contact/:id (admin) — hard delete
export const deleteContactMessage = async (id: string): Promise<void> => {
  await httpClient.delete(`contact/${id}`);
};
