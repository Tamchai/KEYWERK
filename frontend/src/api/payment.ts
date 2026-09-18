import { apiFetch } from "./client";
import type { DataResponse, MessageResponse, Payment, PaymentStatus } from "./types";

export const createPayment = (order_id: string) => apiFetch<DataResponse<Payment>>("/payments", { method: "POST", body: JSON.stringify({ order_id }) }).then((r) => r.data);
export const getPayment = (orderId: string) => apiFetch<DataResponse<Payment>>(`/payments/order/${orderId}`).then((r) => r.data);
export const listAdminPayments = () => apiFetch<DataResponse<Payment[]>>("/admin/payments").then((r) => r.data);
export const verifyPayment = (id: string, status: Exclude<PaymentStatus, "pending">) => apiFetch<MessageResponse>(`/admin/payments/${id}/verify`, { method: "PUT", body: JSON.stringify({ status }) });
