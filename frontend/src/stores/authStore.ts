import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as apiLogin, register as apiRegister, type RegisterPayload } from "../api/auth";

function getRoleFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    const role = json?.user_role;
    return typeof role === "string" ? role : null;
  } catch {
    return null;
  }
}

interface AuthState {
  token: string | null;
  email: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      email: null,
      isLoggedIn: false,
      isAdmin: false,

      login: async (loginEmail: string, loginPassword: string) => {
        const response = await apiLogin({ email: loginEmail, password: loginPassword });
        set({
          token: response.token,
          email: response.email,
          isLoggedIn: true,
          isAdmin: getRoleFromToken(response.token) === "admin",
        });
      },

      register: async (payload: RegisterPayload) => {
        await apiRegister(payload);
        await get().login(payload.email, payload.password);
      },

      logout: () => {
        set({
          token: null,
          email: null,
          isLoggedIn: false,
          isAdmin: false,
        });
      },
    }),
    {
      name: "keywerk-auth",
      partialize: (state) => ({
        token: state.token,
        email: state.email,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoggedIn = Boolean(state.token);
          state.isAdmin = getRoleFromToken(state.token) === "admin";
        }
      },
    },
  ),
);
