import httpClient from "@/config/http/httpClient";

/* ================================
   Matches src/paymentReceiving/* on the backend exactly. There is no
   write API — these details are fixed and only changeable via
   backend/scripts/seedPaymentReceiving.js. This client is read-only.
================================ */

export interface PaymentReceivingAccount {
  _id: string;
  accountName: string;
  qrCode?: string;
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  isDefault: boolean;
  isDeleted?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// GET /api/payment-receiving — the current default account. Throws 404 if
// none has been seeded yet.
export const getDefaultPaymentAccount = async (): Promise<PaymentReceivingAccount> => {
  const { data } = await httpClient.get<ApiResponse<PaymentReceivingAccount>>("payment-receiving");
  return data.data;
};
