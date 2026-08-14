import httpClient from "@/config/http/httpClient";

/* ================================
   Matches src/event/* on the backend exactly.
================================ */

export const EVENT_STATUSES = ["active", "inactive"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export interface EventStat {
  value: string;
  label: string;
}

export interface EventActivity {
  title: string;
  description: string;
}

export interface Event {
  _id: string;
  title: string;
  category: string;
  description: string;
  images: string[];
  stats?: EventStat[];
  activities?: EventActivity[];
  eventStartDate?: string;
  eventEndDate?: string;
  status: EventStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface EventFormPayload {
  title: string;
  category: string;
  description: string;
  images: string[];
  stats?: EventStat[];
  activities?: EventActivity[];
  eventStartDate?: string;
  eventEndDate?: string;
  status?: EventStatus;
}

/* ---------- Public ---------- */

export const listEvents = async (): Promise<Event[]> => {
  const { data } = await httpClient.get<ApiResponse<Event[]>>("events");
  return data.data;
};

/* ---------- Admin (requires auth) ---------- */

// GET /api/events/admin — every non-deleted event.
export const adminListEvents = async (): Promise<Event[]> => {
  const { data } = await httpClient.get<ApiResponse<Event[]>>("events/admin");
  return data.data;
};

export const getEventById = async (id: string): Promise<Event> => {
  const { data } = await httpClient.get<ApiResponse<Event>>(`events/${id}`);
  return data.data;
};

export const createEvent = async (payload: EventFormPayload): Promise<Event> => {
  const { data } = await httpClient.post<ApiResponse<Event>>("events", payload);
  return data.data;
};

export const updateEvent = async (id: string, payload: Partial<EventFormPayload>): Promise<Event> => {
  const { data } = await httpClient.patch<ApiResponse<Event>>(`events/${id}`, payload);
  return data.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await httpClient.delete(`events/${id}`);
};

// PATCH /api/events/reorder — ids in the new display order.
export const reorderEvents = async (ids: string[]): Promise<void> => {
  await httpClient.patch("events/reorder", { ids });
};
