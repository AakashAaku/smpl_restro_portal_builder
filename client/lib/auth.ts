// Simple auth management with localStorage
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
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
  return auth?.role === "admin";
}

export function isCustomer(): boolean {
  const auth = getAuth();
  return auth?.role === "customer";
}

// Mock login - in production, call real API
export async function login(
  email: string,
  password: string
): Promise<AuthUser> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  let user: AuthUser;

  if (email === "admin@restaurant.com" && password === "admin123") {
    user = {
      id: "admin-001",
      name: "Restaurant Admin",
      email: "admin@restaurant.com",
      role: "admin",
      token: "admin-token-" + Date.now(),
    };
  } else if (email === "customer@example.com" && password === "customer123") {
    user = {
      id: "cust-001",
      name: "John Doe",
      email: "customer@example.com",
      role: "customer",
      token: "customer-token-" + Date.now(),
    };
  } else {
    // Demo: any other email/pass works as customer
    user = {
      id: "cust-" + Math.random().toString(36).substr(2, 9),
      name: email.split("@")[0],
      email,
      role: email.includes("admin") ? "admin" : "customer",
      token: "token-" + Date.now(),
    };
  }

  saveAuth(user);
  return user;
}

export function logout() {
  clearAuth();
}
