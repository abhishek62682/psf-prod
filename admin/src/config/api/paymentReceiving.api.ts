import httpClient from "@/config/http/httpClient";

/* ================================
   Matches src/paymentReceiving/* on the backend exactly. Only one default
   account is used today — GET / returns that single account (not a list).
   The model/CRUD already support multiple accounts for later; this client
   just doesn't build a switcher UI for that yet.
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

export interface PaymentReceivingPayload {
  accountName: string;
  qrCode?: string;
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  isDefault?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// GET /api/payment-receiving (public) — throws 404 if none configured yet.
export const getDefaultPaymentAccount = async (): Promise<PaymentReceivingAccount> => {
  const { data } = await httpClient.get<ApiResponse<PaymentReceivingAccount>>("payment-receiving");
  return data.data;
};

// GET /api/payment-receiving/:id (admin)
export const getPaymentAccount = async (id: string): Promise<PaymentReceivingAccount> => {
  const { data } = await httpClient.get<ApiResponse<PaymentReceivingAccount>>(
    `payment-receiving/${id}`
  );
  return data.data;
};

// POST /api/payment-receiving (admin)
export const createPaymentAccount = async (
  payload: PaymentReceivingPayload
): Promise<PaymentReceivingAccount> => {
  const { data } = await httpClient.post<ApiResponse<PaymentReceivingAccount>>(
    "payment-receiving",
    payload
  );
  return data.data;
};

// PATCH /api/payment-receiving/:id (admin)
export const updatePaymentAccount = async (
  id: string,
  payload: Partial<PaymentReceivingPayload>
): Promise<PaymentReceivingAccount> => {
  const { data } = await httpClient.patch<ApiResponse<PaymentReceivingAccount>>(
    `payment-receiving/${id}`,
    payload
  );
  return data.data;
};

// DELETE /api/payment-receiving/:id (admin) — soft delete, blocked (409) if in use
export const deletePaymentAccount = async (id: string): Promise<void> => {
  await httpClient.delete(`payment-receiving/${id}`);
};

// DELETE /api/payment-receiving/:id/qr-code (admin)
export const removeQrCode = async (id: string): Promise<PaymentReceivingAccount> => {
  const { data } = await httpClient.delete<ApiResponse<PaymentReceivingAccount>>(
    `payment-receiving/${id}/qr-code`
  );
  return data.data;
};

/* ---------- Audit logs (admin) ---------- */

export interface PaymentReceivingAuditLogChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface PaymentReceivingAuditLog {
  _id: string;
  accountId: { _id: string; accountName: string } | null;
  action: "created" | "updated" | "deleted" | "qr_code_removed";
  changedBy: { _id: string; name: string; email: string } | null;
  changes: PaymentReceivingAuditLogChange[];
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListAuditLogsParams {
  page?: number;
  limit?: number;
  action?: PaymentReceivingAuditLog["action"];
  accountId?: string;
  search?: string;
}

// GET /api/payment-receiving/audit-logs (admin)
export const listPaymentReceivingAuditLogs = async (
  params: ListAuditLogsParams = {}
): Promise<{ logs: PaymentReceivingAuditLog[]; pagination: Pagination }> => {
  const { data } = await httpClient.get<
    ApiResponse<{ logs: PaymentReceivingAuditLog[]; pagination: Pagination }>
  >("payment-receiving/audit-logs", { params });
  return data.data;
};
