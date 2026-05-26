// Centralized type definitions for the entire application

// ==================== User Types ====================
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
  auth_provider?: "local" | "oauth42";
  role?: "user" | "seller" | "admin";
  status?: "active" | "suspended" | "banned" | "deactivated";
  created_at?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  tokens?: AuthTokens;
}

// ==================== Product/Listing Types ====================
export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: ProductCategory;
  condition: "New" | "Used";
  location: string;
  seller: string;
  seller_id?: string;
  status?: string;
  image: string;
  images?: string[];
  postedDate: string;
  fileFormat?: string;
  engine?: string;
  tags?: string[];
  downloads?: number;
  rating?: number;
  review_count?: number;
  shader?: ShaderMetadata;
}

// Alias for consistency with codebase
export type Listing = Product;

export interface ShaderMetadata {
  code: string;
  notes: string;
  language: "glsl";
}

export type ProductCategory =
  | "3D Models"
  | "2D Assets"
  | "Shaders"
  | "Textures"
  | "VFX"
  | "Audio"
  | "UI/UX";

// ==================== Order Types ====================
export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
  shipping_address?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  price: number;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "completed" | "cancelled";

// ==================== Review Types ====================
export interface Review {
  id: string;
  product_id: string;
  reviewer_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string | null;
  body?: string | null;
  status?: string;
  created_at: string;
  updated_at?: string;
  reviewer_name: string;
  reviewer_avatar?: string | null;
}

// ==================== Cart Types ====================
export interface CartItem {
  listing: Listing;
  quantity: number;
}

// ==================== API Response Types ====================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// ==================== Notification Types ====================
// Mirrors the data-service's NotificationListResponse (models/notification.py).
export type NotificationType = "new_listing" | "listing_updated" | "listing_deleted";

export interface NotificationPayload {
  product_name?: string;
  product_slug?: string;
  product_price?: string;
  // extend with extra keys as new notification types appear
}

export interface Notification {
  id: number;
  type: NotificationType | string; // string fallback so unknown future types still parse
  read_at: string | null;
  created_at: string;
  payload: NotificationPayload | null;
  actor_id: number | null;
  actor_name: string | null;
  actor_avatar: string | null;
  product_id: number | null;
  product_name: string | null;
  product_slug: string | null;
  product_price: string | null;
  product_cover: string | null;
}

export interface NotificationUnreadCountResponse {
  num: number;
}

export interface NotificationMarkReadResponse {
  marked: number;
}

// ==================== Form Types ====================
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ProductForm {
  title: string;
  price: number;
  description: string;
  category: ProductCategory;
  condition: string;
  fileFormat?: string;
  engine?: string;
  images: File[];
}

// ==================== Filter/Sort Types ====================
export interface ProductFilters {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "price" | "date" | "rating";
  sortOrder?: "asc" | "desc";
}
