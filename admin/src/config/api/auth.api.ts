import httpClient from "@/config/http/httpClient";
import type { AuthUser } from "@/config/store/auth";

/* ================================
   Matches the NGO Donation Verification Platform backend exactly
   (see README.md / api-test.md — auth is a 2-step login + OTP flow)
================================ */

export interface LoginPayload {
  email: string;
  password: string;
}

// POST /api/auth/login → no "data" wrapper, just success/message (+otp in dev mode)
export interface LoginResponse {
  success: boolean;
  message: string;
  otp?: string; // only present when NODE_ENV=development on the backend
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

// POST /api/auth/verify-otp → token + user, flat (no "data" wrapper)
export interface VerifyOtpResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

// POST /api/auth/forgot-password and /api/auth/reset-password both just
// return { success, message } — no "data" wrapper, same shape as login.
export interface MessageResponse {
  success: boolean;
  message: string;
}

interface GetMeResponse {
  success: boolean;
  message: string;
  data: { user: AuthUser };
}

// Step 1: verify credentials, triggers OTP generation
export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await httpClient.post<LoginResponse>("auth/login", payload);
  return data;
};

// Step 2: verify OTP → receive JWT token + user
export const verifyOtp = async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
  const { data } = await httpClient.post<VerifyOtpResponse>("auth/verify-otp", payload);
  return data;
};

export const logoutUser = async (): Promise<LogoutResponse> => {
  const { data } = await httpClient.post<LogoutResponse>("auth/logout");
  return data;
};

export const forgotPassword = async (payload: ForgotPasswordPayload): Promise<MessageResponse> => {
  const { data } = await httpClient.post<MessageResponse>("auth/forgot-password", payload);
  return data;
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<MessageResponse> => {
  const { data } = await httpClient.post<MessageResponse>("auth/reset-password", payload);
  return data;
};

// GET /api/auth/me — used to silently refresh the logged-in user's data
// (name/avatar/role) on dashboard load, in case it changed elsewhere.
export const getMe = async (): Promise<AuthUser> => {
  const { data } = await httpClient.get<GetMeResponse>("auth/me");
  return data.data.user;
};
