/* eslint-disable @typescript-eslint/no-explicit-any */
import { Listing, User } from "../types";
import { parseShaderDescription } from "./shaders";

const API_URL = "/api";

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}

interface RequestOptions {
  retryOnUnauthorized?: boolean;
}

export function getAccessToken(data: any): string | null {
  return data?.access ?? data?.access_token ?? data?.token ?? data?.tokens?.access ?? null;
}

export function normalizeUser(data: any, fallbackToken?: string | null): User | null {
  const source = data?.user ?? data;
  const tokenUser = fallbackToken ? parseUserFromToken(fallbackToken) : null;
  const id = source?.id ?? source?.user_id ?? source?.external_user_id ?? tokenUser?.id;

  if (!id) return tokenUser;

  return {
    id: String(id),
    email: source?.email ?? tokenUser?.email ?? "",
    name: source?.name ?? source?.display_name ?? tokenUser?.name,
    phone: source?.phone ?? undefined,
    role: normalizeRole(source?.role ?? tokenUser?.role),
    status: normalizeStatus(source?.status),
  };
}

export function parseUserFromToken(jwt: string): User | null {
  try {
    const payload = JSON.parse(window.atob(jwt.split(".")[1]));
    return normalizeUser(
      {
        id: payload.external_user_id ?? payload.user_id ?? payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
      null
    );
  } catch {
    return null;
  }
}

export function mapListing(item: any): Listing {
  const rawDescription = item?.description ?? "";
  const shader = parseShaderDescription(rawDescription);
  const createdAt = item?.created_at ?? item?.postedDate ?? item?.posted_date;

  return {
    id: String(item?.product_id ?? item?.id),
    title: item?.name ?? item?.title ?? "Untitled",
    price: Number(item?.price ?? 0),
    description: shader?.notes ?? rawDescription,
    category: shader ? "Shaders" : (item?.category ?? "3D Models"),
    condition: item?.status ?? "New",
    location: "Digital Download",
    seller: item?.seller ?? item?.seller_name ?? "Creator Studio",
    seller_id: item?.seller_id ? String(item.seller_id) : undefined,
    image:
      item?.image ??
      item?.image_url ??
      "https://images.unsplash.com/photo-1636189239307-9f3a701f30a8",
    postedDate: createdAt
      ? new Date(createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    fileFormat: shader ? "GLSL" : (item?.fileFormat ?? item?.file_format),
    engine: shader ? "Three.js" : item?.engine,
    shader: shader ?? undefined,
  };
}

function normalizeRole(role: unknown): User["role"] | undefined {
  const value = String(role ?? "").toLowerCase();
  if (value === "admin" || value === "seller" || value === "user") return value;
  return undefined;
}

function normalizeStatus(status: unknown): User["status"] | undefined {
  const value = String(status ?? "").toLowerCase();
  if (value === "active" || value === "suspended" || value === "banned") return value;
  if (value === "deactivated" || value === "deleted") return "banned";
  return undefined;
}

class ApiClient {
  private token: string | null = null;
  private tokenChangeHandler: ((token: string | null) => void) | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  setTokenChangeHandler(handler: ((token: string | null) => void) | null) {
    this.tokenChangeHandler = handler;
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const response = await this.fetchJson(method, path, body);
    const data = await response.json().catch(() => ({}));

    if (response.status === 401 && this.token && options.retryOnUnauthorized !== false) {
      const refreshed = await this.refresh().catch(() => null);
      const newToken = getAccessToken(refreshed);

      if (newToken) {
        this.setToken(newToken);
        this.tokenChangeHandler?.(newToken);
        const retryResponse = await this.fetchJson(method, path, body);
        const retryData = await retryResponse.json().catch(() => ({}));

        if (!retryResponse.ok) {
          throw new Error(this.getErrorMessage(retryData, retryResponse.statusText));
        }

        return retryData;
      }
    }

    if (!response.ok) {
      throw new Error(this.getErrorMessage(data, response.statusText));
    }

    return data;
  }

  private fetchJson(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", path: string, body?: any) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private getErrorMessage(data: any, fallback: string) {
    if (typeof data?.detail === "string") return data.detail;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
    if (Array.isArray(data?.non_field_errors)) return data.non_field_errors.join(" ");
    return fallback || "Request failed";
  }

  // AUTH
  register(data: { name: string; email: string; password: string; phone?: string }) {
    return this.request<any>("POST", "/auth/register/", data);
  }

  login(email: string, password: string) {
    return this.request<any>("POST", "/auth/login/", {
      email,
      password,
    });
  }

  refresh() {
    return this.request<any>("POST", "/auth/refresh/", {}, { retryOnUnauthorized: false });
  }

  logout() {
    return this.request<{ detail?: string }>("POST", "/auth/logout/", {});
  }

  getProfile() {
    return this.request<any>("GET", "/auth/profile/");
  }

  getOAuth42Url() {
    return `${API_URL}/auth/42/`;
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

  createListing(data: any, sellerId?: string) {
    const query = sellerId ? `?seller_id=${encodeURIComponent(sellerId)}` : "";
    return this.request<any>("POST", `/listings/${query}`, data);
  }

  updateListing(id: string, data: any) {
    return this.request<any>("PATCH", `/listings/${id}/`, data);
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
    return this.request<any>(
      "POST",
      `/listings/${data.listing_id ?? data.product_id}/review/`,
      data
    );
  }

  getReviews(listingId: string) {
    return this.request<any>("GET", `/listings/${listingId}/review/`);
  }
}

export const api = new ApiClient();
