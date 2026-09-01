import { apiFetch } from "./client";
import type { LoginResponse, MessageResponse } from "./types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  image?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function register(payload: RegisterPayload) {
  return apiFetch<MessageResponse>("/register", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginPayload) {
  return apiFetch<LoginResponse>("/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}
