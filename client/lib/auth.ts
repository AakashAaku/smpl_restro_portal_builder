const API_URL = import.meta.env.VITE_API_URL || "/api";

// Simple auth management with localStorage
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  token: string;
}

export function saveAuth(user: AuthUser) {
  localStorage.setItem("auth_user", JSON.stringify(user));
  localStorage.setItem("auth_token", user.token);
}

export function getAuth(): AuthUser | null {
  const stored = localStorage.getItem("auth_user");
  return stored ? JSON.parse(stored) : null;
}

export const getMe = getAuth;

export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function clearAuth() {
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_token");
  localStorage.removeItem("cart_items");
}

export function isAuthenticated(): boolean {
  return getAuth() !== null && getAuthToken() !== null;
}

export function isAdmin(): boolean {
  const auth = getAuth();
  return auth?.role === "ADMIN" || auth?.role === "admin";
}

export function isStaff(): boolean {
  const auth = getAuth();
  return auth?.role !== "CUSTOMER";
}

export function isCustomer(): boolean {
  const auth = getAuth();
  return auth?.role === "CUSTOMER" || auth?.role === "customer";
}
// Real login calling backend API
export async function login(
  email: string,
  password: string
): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  const data = await response.json();
  const user: AuthUser = {
    ...data.user,
    token: data.token,
  };

  saveAuth(user);
  return user;
}

export function logout() {
  clearAuth();
}
