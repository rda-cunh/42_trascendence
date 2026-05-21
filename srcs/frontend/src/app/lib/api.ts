/* eslint-disable @typescript-eslint/no-explicit-any */
import { Listing, User, Review } from "../types";
import { FALLBACK_LISTING_IMAGE, resolveImageUrl } from "./images";
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

export interface ListingImageRecord {
  id: number;
  product_id: number;
  image_hash: string;
  display_order: number;
  created_at: string;
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
  const id = source?.id ?? source?.user_id ?? tokenUser?.id ?? source?.external_user_id;

  if (!id) return tokenUser;

  return {
    id: String(id),
    email: source?.email ?? tokenUser?.email ?? "",
    name: source?.name ?? source?.display_name ?? tokenUser?.name,
    phone: source?.phone ?? undefined,
    avatar_url: source?.avatar_url ?? source?.avatarUrl ?? tokenUser?.avatar_url,
    role: normalizeRole(source?.role ?? tokenUser?.role),
    status: normalizeStatus(source?.status),
  };
}

export function parseUserFromToken(jwt: string): User | null {
  try {
    const payload = JSON.parse(window.atob(jwt.split(".")[1]));
    return normalizeUser(
      {
        id: payload.user_id ?? payload.sub ?? payload.external_user_id,
        external_user_id: payload.external_user_id,
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
  const normalizedImages = images
    .map((image: any) => (typeof image === "string" ? image : (image?.image_hash ?? image?.images)))
    .filter((image: unknown): image is string => typeof image === "string" && image.length > 0);
  const firstImage = normalizedImages[0];
  const sellerName =
    typeof item?.seller === "string"
      ? item.seller
      : (item?.seller?.name ?? item?.seller_name ?? "Creator Studio");

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
    images: normalizedImages,
    image: resolveImageUrl(item?.image ?? item?.image_url ?? firstImage, FALLBACK_LISTING_IMAGE),
    postedDate: createdAt
      ? new Date(createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    fileFormat: shader ? "GLSL" : (item?.fileFormat ?? item?.file_format),
    engine: shader ? "Three.js" : item?.engine,
    rating: item?.avg_rating != null ? Number(item.avg_rating) : undefined,
    review_count: item?.review_count != null ? Number(item.review_count) : 0,
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
    return this.request<any>("GET", "/auth/profile/").then((data) =>
      normalizeProfileResponse(data)
    );
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
    return this.request<any>("GET", `/users/${userId}/`).then((data) =>
      normalizeProfileResponse(data)
    );
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
  createReview(data: {
    listing_id?: string | number;
    product_id?: string | number;
    rating: number;
    title?: string;
    body?: string;
  }) {
    const productId = data.listing_id ?? data.product_id;
    return this.request<Review>("POST", `/listings/${productId}/reviews/`, {
      rating: data.rating,
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.body?.trim() ? { body: data.body.trim() } : {}),
    });
  }

  async getReviews(listingId: string, page = 1) {
    try {
      const path =
        page > 1 ? `/listings/${listingId}/reviews/?page=${page}` : `/listings/${listingId}/reviews/`;
      const data = await this.request<Review[]>("GET", path);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  getReview(listingId: string, reviewId: string) {
    return this.request<Review>("GET", `/listings/${listingId}/reviews/${reviewId}/`);
  }

  updateReview(
    listingId: string,
    reviewId: string,
    data: { rating?: number; title?: string; body?: string }
  ) {
    return this.request<Review>("PATCH", `/listings/${listingId}/reviews/${reviewId}/`, data);
  }

  deleteReview(listingId: string, reviewId: string) {
    return this.request<void>("DELETE", `/listings/${listingId}/reviews/${reviewId}/`);
  }

  // IMAGES
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
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(this.getErrorMessage(data, response.statusText));
      }

      return data as { filename: string; url?: string };
    });
  }

  getListingImages(listingId: string | number) {
    return this.request<ListingImageRecord[]>("GET", `/listings/${listingId}/images/`);
  }

  addListingImage(listingId: string | number, imageHash: string, displayOrder: number) {
    return this.request<ListingImageRecord>("POST", `/listings/${listingId}/images/`, {
      image_hash: imageHash,
      display_order: displayOrder,
    });
  }

  deleteListingImage(listingId: string | number, imageId: number) {
    return this.request<void>("DELETE", `/listings/${listingId}/images/${imageId}/`, {});
  }

  // FOLLOW/SOCIAL
  followUser(followingId: number) {
    return this.request<any>("POST", "/follow/", {
      following_id: followingId,
    });
  }

  unfollowUser(followingId: number) {
    return this.request<any>("DELETE", "/follow/", {
      following_id: followingId,
    });
  }

  getFollowerCount(userId: number) {
    return this.request<{ followers: number; following: number }>(
      "GET",
      `/follow/counts/${userId}/`
    );
  }

  getFollowingCount(userId: number) {
    return this.request<{ followers: number; following: number }>(
      "GET",
      `/follow/counts/${userId}/`
    );
  }

  getFollowing(userId: number, limit?: number, offset?: number) {
    let url = `/follow/following/${userId}/`;
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());
    if (params.toString()) url += `?${params.toString()}`;
    return this.request<any>("GET", url);
  }

  getFollowers(userId: number, limit?: number, offset?: number) {
    let url = `/follow/followers/${userId}/`;
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());
    if (params.toString()) url += `?${params.toString()}`;
    return this.request<any>("GET", url);
  }

  pingPresence() {
    return this.request<void>("POST", "/presence/ping/");
  }

  getPresence(userIds: number[]) {
    if (!userIds || userIds.length === 0) return Promise.resolve({});
    const uniqueIds = Array.from(new Set(userIds)).slice(0, 200);
    return this.request<Record<string, boolean>>("GET", `/presence/?ids=${uniqueIds.join(",")}`);
  }
}

export const api = new ApiClient();
