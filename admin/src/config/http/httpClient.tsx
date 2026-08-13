import axios from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "@/config/store/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use(function (config) {
  const authorizationToken = Cookies.get("accessToken");
  if (authorizationToken) {
    config.headers.Authorization = `Bearer ${authorizationToken}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Global session guard: if any authenticated request comes back 401
// (expired/invalid JWT — see middlewares/authenticate.js), the token is no
// longer good for anything. Clear local auth state and bounce to login.
// Guarded by "did we actually have a token" so this never fires for the
// login/verify-otp endpoints themselves (wrong password, wrong OTP), which
// legitimately return 401 while the user isn't authenticated yet.
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = !!Cookies.get("accessToken");
    if (error?.response?.status === 401 && hadToken) {
      useAuthStore.getState().logout();
      if (!window.location.pathname.startsWith("/auth")) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default httpClient;
