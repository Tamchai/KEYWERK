import { apiFetch } from "./client";
import type { CreateOrderPayload, DataResponse, MessageResponse, Order, OrderDetail, OrderStatus } from "./types";

export const listOrders = () => apiFetch<DataResponse<Order[]>>("/orders").then((r) => r.data);
export const getOrder = (id: string) => apiFetch<DataResponse<OrderDetail>>(`/orders/${id}`).then((r) => r.data);
export const createOrder = (body: CreateOrderPayload) => apiFetch<DataResponse<OrderDetail>>("/orders", { method: "POST", body: JSON.stringify(body) }).then((r) => r.data);
export const updateOrderAddress = (id: string, body: Omit<CreateOrderPayload, "address_id" | "shipping_method" | "items">) => apiFetch<MessageResponse>(`/orders/${id}/address`, { method: "PUT", body: JSON.stringify(body) });
export const listAdminOrders = () => apiFetch<DataResponse<Order[]>>("/admin/orders").then((r) => r.data);
export const updateOrderStatus = (id: string, status: OrderStatus) => apiFetch<MessageResponse>(`/admin/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
export const updateTracking = (id: string, tracking_number: string, status: OrderStatus = "shipped") => apiFetch<MessageResponse>(`/admin/orders/${id}/tracking`, { method: "PUT", body: JSON.stringify({ tracking_number, status }) });
