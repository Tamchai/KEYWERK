import { apiFetch } from "./client";
import type { Address, AddressPayload, DataResponse, MessageResponse } from "./types";

export const listAddresses = () => apiFetch<DataResponse<Address[]>>("/addresses").then((r) => r.data);
export const createAddress = (body: AddressPayload) => apiFetch<MessageResponse>("/addresses", { method: "POST", body: JSON.stringify(body) });
export const updateAddress = (id: string, body: AddressPayload) => apiFetch<MessageResponse>(`/addresses/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteAddress = (id: string) => apiFetch<MessageResponse>(`/addresses/${id}`, { method: "DELETE" });
