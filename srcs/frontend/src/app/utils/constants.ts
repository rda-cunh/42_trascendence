/**
 * Application-wide constants
 */

// API Configuration
export const API_BASE_URL = "/api";
export const API_TIMEOUT = 30000; // 30 seconds

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Categories
export const PRODUCT_CATEGORIES = [
  "All",
  "3D Models",
  "2D Assets",
  "Shaders",
  "Textures",
  "VFX",
  "Audio",
  "UI/UX",
] as const;

// User Roles
export const USER_ROLES = {
  USER: "user",
  SELLER: "seller",
  ADMIN: "admin",
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGES_PER_PRODUCT = 5;

// Validation
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 64;
export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 50;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  AUTH_USER: "auth_user",
  CART_ITEMS: "cart_items",
  THEME: "theme",
  RECENT_SEARCHES: "recent_searches",
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  PRODUCTS: "/search",
  PRODUCT_DETAIL: "/product/:id",
  SELL: "/sell",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDERS: "/orders",
  ORDER_DETAIL: "/orders/:id",
  CHAT: "/chat",
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_LISTINGS: "/admin/listings",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You must be logged in to perform this action.",
  FORBIDDEN: "You don't have permission to access this resource.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UPLOAD_ERROR: "Failed to upload file. Please try again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: "Successfully logged in!",
  REGISTER: "Account created successfully!",
  LOGOUT: "Successfully logged out!",
  UPDATE_PROFILE: "Profile updated successfully!",
  CREATE_PRODUCT: "Product created successfully!",
  UPDATE_PRODUCT: "Product updated successfully!",
  DELETE_PRODUCT: "Product deleted successfully!",
  ADD_TO_CART: "Added to cart!",
  REMOVE_FROM_CART: "Removed from cart!",
  ORDER_PLACED: "Order placed successfully!",
} as const;

// Regex Patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  URL: /^https?:\/\/.+/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

// Animation Durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
} as const;
