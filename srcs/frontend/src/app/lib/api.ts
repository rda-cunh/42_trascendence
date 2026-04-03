const API_BASE = "/api";

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(errorBody || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string; phone?: string; avatar_url?: string }) =>
    request<{ user: any; token: string }>("/auth/register/", { method: "POST", body: data }),

  login: (data: { email?: string; username?: string; password?: string }) =>
    request<{ user: any; token: string }>("/auth/login/", { method: "POST", body: data }),

  getProfile: (token: string) =>
    request<any>("/auth/profile/", { token }),

  updateProfile: (data: any, token: string) =>
    request<any>("/auth/profile/", { method: "PATCH", body: data, token }),

  deleteProfile: (token: string) =>
    request<void>("/auth/profile/", { method: "DELETE", token }),

  changePassword: (data: { old_password: string; new_password: string }, token: string) =>
    request<void>("/auth/password/", { method: "PATCH", body: data, token }),

  // Users
  getUser: (id: string) =>
    request<any>(`/users/${id}/`),

  // Listings
  getListings: () =>
    request<any>("/listings/"),

  getListing: (id: string) =>
    request<any>(`/listings/${id}/`),

  createListing: (data: any, token: string) =>
    request<any>("/listings/", { method: "POST", body: data, token }),

  updateListing: (id: string, data: any, token: string) =>
    request<any>(`/listings/${id}/`, { method: "PATCH", body: data, token }),

  deleteListing: (id: string, token: string) =>
    request<void>(`/listings/${id}/`, { method: "DELETE", token }),

  // Orders
  getOrders: (token: string) =>
    request<any>("/orders/", { token }),

  createOrder: (data: any, token: string) =>
    request<any>("/orders/", { method: "POST", body: data, token }),

  getOrder: (id: string, token: string) =>
    request<any>(`/orders/${id}/`, { token }),

  updateOrder: (id: string, data: any, token: string) =>
    request<any>(`/orders/${id}/`, { method: "PATCH", body: data, token }),
};
