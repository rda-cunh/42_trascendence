import type {
  Notification,
  NotificationPayload,
  NotificationUnreadCountResponse,
  NotificationMarkReadResponse,
} from "../types";

const API_BASE = "/api";

// ---- shared helpers (mirrors chatApi.ts) -----------------------

function getAuthHeaders(): HeadersInit {
  const accessToken = localStorage.getItem("auth_token");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken && accessToken !== "undefined" && accessToken !== "null") {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
}

async function handleJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorBody: unknown = null;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    throw new Error(
      `Request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorBody)}`
    );
  }
  return response.json() as Promise<T>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// ---- normalization ---------------------------------------------------------
// Backend returns shapes we already control, but we still coerce nulls/types to ensure our frontend code can rely on consistent types and avoid runtime errors if backend changes or returns unexpected data. This is especially important for notifications since they may have optional fields depending on the type.

function normalizePayload(value: unknown): NotificationPayload | null {
  if (!isRecord(value)) return null;
  return {
    product_name: typeof value.product_name === "string" ? value.product_name : undefined,
    product_slug: typeof value.product_slug === "string" ? value.product_slug : undefined,
    product_price: typeof value.product_price === "string" ? value.product_price : undefined,
  };
}

function normalizeNotification(item: unknown): Notification {
  const r = isRecord(item) ? item : {};
  return {
    id: Number(r.id),
    type: typeof r.type === "string" ? r.type : "unknown",
    read_at: typeof r.read_at === "string" ? r.read_at : null,
    created_at: typeof r.created_at === "string" ? r.created_at : "",
    payload: normalizePayload(r.payload),
    actor_id: typeof r.actor_id === "number" ? r.actor_id : null,
    actor_name: typeof r.actor_name === "string" ? r.actor_name : null,
    actor_avatar: typeof r.actor_avatar === "string" ? r.actor_avatar : null,
    product_id: typeof r.product_id === "number" ? r.product_id : null,
    product_name: typeof r.product_name === "string" ? r.product_name : null,
    product_slug: typeof r.product_slug === "string" ? r.product_slug : null,
    product_price:
      typeof r.product_price === "string"
        ? r.product_price
        : r.product_price != null
          ? String(r.product_price)
          : null,
    product_cover: typeof r.product_cover === "string" ? r.product_cover : null,
  };
}

// ---- public API ------------------------------------------------------------

export interface FetchNotificationsOptions {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

export async function fetchNotifications(
  options: FetchNotificationsOptions = {}
): Promise<Notification[]> {
  const params = new URLSearchParams();
  if (options.limit !== undefined) params.set("limit", String(options.limit));
  if (options.offset !== undefined) params.set("offset", String(options.offset));
  if (options.unreadOnly) params.set("unread_only", "true");

  const query = params.toString();
  const url = query ? `${API_BASE}/notifications/?${query}` : `${API_BASE}/notifications/`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  const data = await handleJsonResponse<unknown>(response);
  return Array.isArray(data) ? data.map(normalizeNotification) : [];
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await fetch(`${API_BASE}/notifications/unread-count/`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  const data = await handleJsonResponse<NotificationUnreadCountResponse>(response);
  return typeof data.num === "number" ? data.num : 0;
}

export async function markNotificationsRead(ids: number[]): Promise<number> {
  if (ids.length === 0) return 0;

  const response = await fetch(`${API_BASE}/notifications/read/`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({ ids }),
  });

  const data = await handleJsonResponse<NotificationMarkReadResponse>(response);
  return typeof data.marked === "number" ? data.marked : 0;
}

export async function markAllNotificationsRead(): Promise<number> {
  const response = await fetch(`${API_BASE}/notifications/read-all/`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  const data = await handleJsonResponse<NotificationMarkReadResponse>(response);
  return typeof data.marked === "number" ? data.marked : 0;
}
