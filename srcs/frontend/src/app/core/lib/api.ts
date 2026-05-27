/* eslint-disable @typescript-eslint/no-explicit-any */
import { Review } from "@/app/core/types";
import { API_URL, HttpClient } from "./http";
import { getAccessToken, mapAdminUser, mapOrder, normalizeProfileResponse } from "./mappers";

export type { ApiError } from "./http";
export {
  getAccessToken,
  isDeletedListing,
  mapListing,
  normalizeUser,
  parseUserFromToken,
} from "./mappers";

export interface ListingImageRecord {
  id: number;
  product_id: number;
  image_hash: string;
  display_order: number;
  created_at: string;
}

export type ListingStatus = "Draft" | "Active" | "Paused" | "Deleted";

export interface AdminDashboardData {
  total_revenue: number;
  total_users: number;
  total_orders: number;
  active_listings: number;
  orders_trend: number[];
  revenue_overview: number[];
  months: string[];
}

export interface GetListingsFilters {
  status?: ListingStatus;
  search?: string;
  page?: number;
  seller_id?: number;
}

export interface GetPublicListingsFilters {
  search?: string;
  page?: number;
  limit?: number;
}

class ApiClient extends HttpClient {
  refreshToken() {
    return this.refresh();
  }

  protected override refresh() {
    return this.request<any>("POST", "/auth/refresh/", {}, { retryOnUnauthorized: false });
  }

  protected override getAccessTokenFromResponse(data: any) {
    return getAccessToken(data);
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

  deleteProfile(password: string) {
    return this.request<any>("DELETE", "/auth/profile/", { password });
  }

  changePassword(password: string, newPassword: string) {
    return this.request<any>("PATCH", "/auth/password/", {
      password,
      new_password: newPassword,
    });
  }

  // LISTINGS
  getListings(filters?: GetListingsFilters) {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.search?.trim()) params.set("search", filters.search.trim());
    if (filters?.page && filters.page > 0) params.set("page", String(filters.page));
    if (filters?.seller_id) params.set("seller_id", String(filters.seller_id));

    const query = params.toString();
    return this.request<any>("GET", `/listings/${query ? `?${query}` : ""}`);
  }

  getPublicListings(filters?: GetPublicListingsFilters) {
    const params = new URLSearchParams();
    const limit = filters?.limit && filters.limit > 0 ? filters.limit : 10;

    params.set("limit", String(limit));
    if (filters?.search?.trim()) params.set("search", filters.search.trim());
    if (filters?.page && filters.page > 0) {
      params.set("skip", String((filters.page - 1) * limit));
    }

    return this.request<any[]>("GET", `/public/listings/?${params.toString()}`);
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

  // ADMIN
  getAdminUsers(search?: string) {
    const params = new URLSearchParams({ limit: "200" });
    if (search?.trim()) params.set("search", search.trim());

    return this.request<any[]>("GET", `/admin/users/?${params.toString()}`).then((data) =>
      Array.isArray(data) ? data.map(mapAdminUser) : []
    );
  }

  banUser(userId: string | number) {
    return this.request<any>("POST", `/admin/bans/${userId}/`, {}).then(mapAdminUser);
  }

  unbanUser(userId: string | number) {
    return this.request<any>("DELETE", `/admin/bans/${userId}/`, {}).then(mapAdminUser);
  }

  deleteUser(userId: string | number) {
    return this.request<void>("DELETE", `/admin/users/${userId}/`, {});
  }

  getAdminDashboard() {
    return this.request<AdminDashboardData>("GET", "/admin/dashboard/");
  }

  promoteToAdmin(userId: string | number) {
    return this.request<any>("POST", `/admin/manage/${userId}/`, {}).then(mapAdminUser);
  }

  revokeAdmin(userId: string | number) {
    return this.request<any>("DELETE", `/admin/manage/${userId}/`, {}).then(mapAdminUser);
  }

  // ORDERS
  createOrder(data: any) {
    return this.request<any>("POST", "/orders/", data);
  }

  updateOrder(orderId: string | number, data: { status: string }) {
    return this.request<any>("PATCH", `/orders/${orderId}/`, data);
  }

  createCheckout(data: { items: Array<{ id: number; quantity: number }> }) {
    return this.request<{ checkout_url: string; session_id: string }>(
      "POST",
      "/orders/create-checkout/",
      data
    );
  }

  finalizeCheckout(sessionId: string) {
    return this.request<any>("POST", "/orders/", { session_id: sessionId });
  }

  getOrders(buyerId: string | number) {
    return this.request<any[]>("GET", `/orders/buyer/${buyerId}/`).then((data) =>
      Array.isArray(data) ? data.map(mapOrder) : []
    );
  }

  getSoldOrders(sellerId: string | number) {
    return this.request<any[]>("GET", `/orders/seller/${sellerId}/`).then((data) =>
      Array.isArray(data) ? data.map(mapOrder) : []
    );
  }

  getOrder(id: string) {
    return this.request<any>("GET", `/orders/${id}/`).then(mapOrder);
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
        page > 1
          ? `/listings/${listingId}/reviews/?page=${page}`
          : `/listings/${listingId}/reviews/`;
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

  // FOLLOW / SOCIAL
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
