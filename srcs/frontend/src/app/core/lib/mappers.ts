/* eslint-disable @typescript-eslint/no-explicit-any */
import { Listing, OrderStatus, User } from "@/app/core/types";
import { FALLBACK_LISTING_IMAGE, resolveImageUrl } from "./images";
import { parseShaderDescription } from "./shaders";

export function isDeletedListing(item: any): boolean {
  return String(item?.status ?? "").toLowerCase() === "deleted";
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
    status: item?.status,
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

export function normalizeProfileResponse<T extends { listings?: Array<Record<string, any>> }>(
  data: T
): T {
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

function normalizeAdminStatus(status: unknown): User["status"] | undefined {
  const value = String(status ?? "").toLowerCase();
  if (
    value === "active" ||
    value === "suspended" ||
    value === "banned" ||
    value === "deactivated"
  ) {
    return value;
  }
  if (value === "deleted") return "deactivated";
  return undefined;
}

export function mapAdminUser(item: any): User {
  return {
    id: String(item?.id ?? item?.user_id ?? ""),
    email: item?.email ?? "",
    name: item?.name ?? undefined,
    phone: item?.phone ?? undefined,
    avatar_url: item?.avatar_url ?? item?.avatarUrl ?? undefined,
    role: normalizeRole(item?.role),
    status: normalizeAdminStatus(item?.status),
    created_at: item?.created_at ?? undefined,
  };
}

function normalizeOrderStatus(status: unknown): OrderStatus {
  const value = String(status ?? "").toLowerCase();

  if (value === "pending") return "pending";
  if (value === "paid") return "processing";
  if (value === "shipped") return "shipped";
  if (value === "delivered" || value === "done") return "completed";
  if (value === "cancelled" || value === "refunded") return "cancelled";

  if (value === "processing" || value === "completed" || value === "shipped") {
    return value;
  }

  return "pending";
}

function mapOrderItem(item: any) {
  return {
    id: String(item?.id ?? ""),
    product_id: String(item?.product_id ?? ""),
    quantity: Number(item?.quantity ?? item?.qty ?? 0),
    price: Number(item?.price ?? 0),
    name: item?.name ?? item?.product_name ?? `Item ${item?.id ?? ""}`,
  };
}

export function mapOrder(item: any) {
  return {
    id: String(item?.id ?? ""),
    user_id: String(item?.buyer_id ?? item?.user_id ?? ""),
    status: normalizeOrderStatus(item?.status),
    total: Number(item?.total ?? 0),
    created_at: item?.created_at ?? "",
    updated_at: item?.updated_at,
    items: Array.isArray(item?.items) ? item.items.map(mapOrderItem) : [],
    shipping_address: item?.shipping_address,
  };
}
