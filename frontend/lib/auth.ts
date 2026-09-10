export interface User {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  role: "CUSTOMER" | "OWNER" | "ADMIN" | string;
  status?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export const AUTH_TOKEN_KEY = "lapangin_token";
export const AUTH_USER_KEY = "lapangin_user";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}

export function setAuthSession(token: string, user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  const isSecure = window.location.protocol === "https:";
  document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  const isSecure = window.location.protocol === "https:";
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

export async function logoutUser(): Promise<void> {
  const token = getAuthToken();
  if (token) {
    try {
      const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const apiUrl = rawUrl.endsWith("/api") ? rawUrl : `${rawUrl}/api`;
      await fetch(`${apiUrl}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (e) {
      console.warn("Logout request failed:", e);
    }
  }
  clearAuthSession();
}

