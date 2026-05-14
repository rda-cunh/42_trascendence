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

function pickFirstErrorValue(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const nested = pickFirstErrorValue(entry);
      if (nested) return nested;
    }
    return null;
  }

  if (value && typeof value === "object") {
    for (const nestedValue of Object.values(value as Record<string, unknown>)) {
      const nested = pickFirstErrorValue(nestedValue);
      if (nested) return nested;
    }
  }

  return null;
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
  const images = Array.isArray(item?.images) ? item.images : [];
  const sellerName =
    typeof item?.seller === "string"
      ? item.seller
      : item?.seller?.name ?? item?.seller_name ?? "Creator Studio";

  return {
    id: String(item?.product_id ?? item?.id),
    title: item?.name ?? item?.title ?? "Untitled",
    price: Number(item?.price ?? 0),
    description: shader?.notes ?? rawDescription,
    category: shader ? "Shaders" : (item?.category ?? "3D Models"),
    condition: item?.status ?? "New",
    location: "Digital Download",
    seller: sellerName,
    seller_id: item?.seller_id ? String(item.seller_id) : undefined,
    images: images,
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

function normalizeProfileResponse<T extends { listings?: Array<Record<string, any>> }>(data: T): T {
  if (!data || !Array.isArray(data.listings)) {
    return data;
  }

  return {
    ...data,
    listings: data.listings.map((listing) => ({
      ...listing,
      price: Number(listing?.price ?? 0),
    })),
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
    const detail = pickFirstErrorValue(data?.detail);
    if (detail) return detail;

    const message = pickFirstErrorValue(data?.message);
    if (message) return message;

    const error = pickFirstErrorValue(data?.error);
    if (error) return error;

    const nonFieldErrors = pickFirstErrorValue(data?.non_field_errors);
    if (nonFieldErrors) return nonFieldErrors;

    const fieldError = pickFirstErrorValue(data);
    if (fieldError) return fieldError;

    return fallback || "Request failed";
  }

  // AUTH
  register(data: { name: string; email: string; password: string; phone?: string }) {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}),
    };

    return this.request<any>("POST", "/auth/register/", payload);
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
    return this.request<any>("GET", "/auth/profile/").then((data) => normalizeProfileResponse(data));
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

  getPublicUserProfile(userId: string | number) {
    return this.request<any>("GET", `/users/${userId}/`).then((data) => normalizeProfileResponse(data));
  }

  createListing(data: any) {
    return this.request<any>("POST", `/listings/`, data);
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

  async getReviews(listingId: string) {
    try {
      const data = await this.request<any>("GET", `/listings/${listingId}/review/`);
      return Array.isArray(data) ? data : data?.results || [];
    } catch {
      return [];
    }
  }

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return fetch("/images/upload", {
      method: "POST",
      headers,
      credentials: "include",
      body: formData,
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(this.getErrorMessage(data, response.statusText));
        }

        return data as { filename: string; url?: string };
      });
  }

  // FOLLOW/SOCIAL
  // Follow endpoints are not available right now.
  // Keep these stubs commented until backend API is exposed.
  // followUser(userId: number, followingId: number) {
  //   return this.request<any>("POST", "/follow/add/", {
  //     user_id: userId,
  //     following_id: followingId,
  //   });
  // }
  //
  // unfollowUser(userId: number, followingId: number) {
  //   return this.request<any>("DELETE", "/follow/remove/", {
  //     user_id: userId,
  //     following_id: followingId,
  //   });
  // }
  //
  // getFollowerCount(userId: number) {
  //   return this.request<{ num: number }>("GET", `/follow/followers-count/${userId}/`);
  // }
  //
  // getFollowingCount(userId: number) {
  //   return this.request<{ num: number }>("GET", `/follow/following-count/${userId}/`);
  // }
  //
  // getFollowers(userId: number, limit?: number, offset?: number) {
  //   let url = `/follow/followers/${userId}/`;
  //   const params = new URLSearchParams();
  //   if (limit) params.append("limit", limit.toString());
  //   if (offset) params.append("offset", offset.toString());
  //   if (params.toString()) url += `?${params.toString()}`;
  //   return this.request<any>("GET", url);
  // }
}

export const api = new ApiClient();
