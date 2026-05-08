/* eslint-disable @typescript-eslint/no-explicit-any */
const API_URL = "/api";

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    body?: any
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = data.detail || data.message || response.statusText;
      throw new Error(error);
    }

    return data;
  }

  // AUTH
  register(data: { name: string; email: string; password: string; phone?: string }) {
    return this.request<{ access: string; user: any }>("POST", "/auth/register/", data);
  }

  login(email: string, password: string) {
    return this.request<{ access: string; user: any }>("POST", "/auth/login/", {
      email,
      password,
    });
  }

  refresh() {
    return this.request<{ access: string }>("POST", "/auth/refresh/", {});
  }

  logout() {
    return this.request<{ detail?: string }>("POST", "/auth/logout/", {});
  }

  getProfile() {
    return this.request<any>("GET", "/auth/profile/");
  }

  updateProfile(data: { name?: string; phone?: string; avatar_url?: string }) {
    return this.request<any>("PATCH", "/auth/profile/", data);
  }

  changePassword(password: string, newPassword: string) {
    return this.request<any>("PATCH", "/auth/password/", {
      password,
      new_password: newPassword,
    });
  }

  // LISTINGS
  getListings() {
    return this.request<any>("GET", "/listings/");
  }

  getListing(id: string) {
    return this.request<any>("GET", `/listings/${id}/`);
  }

  createListing(data: any) {
    return this.request<any>("POST", "/listings/", data);
  }

  updateListing(id: string, data: any) {
    return this.request<any>("PUT", `/listings/${id}/`, data);
  }

  deleteListing(id: string) {
    return this.request<any>("DELETE", `/listings/${id}/`, {});
  }

  // ORDERS
  createOrder(data: any) {
    return this.request<any>("POST", "/orders/", data);
  }

  getOrders() {
    return this.request<any>("GET", "/orders/");
  }

  getOrder(id: string) {
    return this.request<any>("GET", `/orders/${id}/`);
  }

  // REVIEWS
  createReview(data: any) {
    return this.request<any>("POST", "/reviews/", data);
  }

  getReviews(listingId: string) {
    return this.request<any>("GET", `/listings/${listingId}/reviews/`);
  }
}

export const api = new ApiClient();
