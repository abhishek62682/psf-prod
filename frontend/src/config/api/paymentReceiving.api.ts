import httpClient from "@/config/http/httpClient";

/* ================================
   Matches src/paymentReceiving/* on the backend (public route only).
================================ */

export interface PaymentReceivingAccount {
  _id: string;
  accountName: string;
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  qrCode?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// GET /api/payment-receiving — the current default payment receiving
// account (single object, not a list).
export const getPaymentReceivingAccount = async (): Promise<PaymentReceivingAccount> => {
  const { data } = await httpClient.get<ApiResponse<PaymentReceivingAccount>>("/payment-receiving");
  return data.data;
};
