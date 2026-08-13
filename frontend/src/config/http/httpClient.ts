import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Public site — no auth token, no credentials. Every request here hits
// the backend's public (non-admin) endpoints only.
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default httpClient;
