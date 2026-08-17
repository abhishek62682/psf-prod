import httpClient from "@/config/http/httpClient";

/* ================================
   Matches src/event/* on the backend (public route only).
================================ */

export interface EventStat {
  value: string;
  label: string;
}

export interface EventActivity {
  title: string;
  description: string;
}

export interface EventDocument {
  url: string;
  label: string;
}

export interface Event {
  _id: string;
  title: string;
  category: string;
  description: string;
  images: string[];
  documents?: EventDocument[];
  stats?: EventStat[];
  activities?: EventActivity[];
  eventStartDate?: string;
  eventEndDate?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// GET /api/events — latest events, newest first.
export const listEvents = async (): Promise<Event[]> => {
  const { data } = await httpClient.get<ApiResponse<Event[]>>("/events");
  return data.data;
};
