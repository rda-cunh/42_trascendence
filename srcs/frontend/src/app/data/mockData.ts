// Centralized mock data service for development/testing
import { Listing } from "./mockListings";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: string;
  status?: string;
  created_at?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  text: string;
  date: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  items: number;
  seller?: string;
  buyer?: string;
}

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Order",
    message: "Your asset 'Shader Pack' was purchased!",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    title: "Price Drop",
    message: "An item on your wishlist is now on sale.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    title: "Review",
    message: "Someone left a 5-star review on your listing.",
    time: "3 hours ago",
    read: true,
  },
];

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: "1",
    user: "GameDev42",
    rating: 5,
    text: "Excellent quality! Exactly what I needed for my project.",
    date: "2026-03-10",
  },
  {
    id: "2",
    user: "PixelArtist",
    rating: 4,
    text: "Great asset, well-organized files. Would buy again.",
    date: "2026-03-08",
  },
  {
    id: "3",
    user: "UnityFan",
    rating: 5,
    text: "Perfect integration with my workflow. Highly recommended!",
    date: "2026-03-05",
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: "ORD-2026-001",
    date: "2026-03-15",
    total: 125,
    status: "Completed",
    items: 3,
  },
  {
    id: "ORD-2026-002",
    date: "2026-03-10",
    total: 65,
    status: "Processing",
    items: 2,
  },
  {
    id: "ORD-2026-003",
    date: "2026-02-28",
    total: 45,
    status: "Completed",
    items: 1,
  },
];

// Mock Users (for admin)
export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Creator",
    email: "john@example.com",
    phone: "+1234567890",
    role: "seller",
    status: "active",
    created_at: "2026-01-15",
  },
  {
    id: "2",
    name: "Jane Buyer",
    email: "jane@example.com",
    role: "user",
    status: "active",
    created_at: "2026-02-01",
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    created_at: "2025-12-01",
  },
];

// Mock Listings (for admin moderation)
export const mockAdminListings: Listing[] = [
  {
    id: "1",
    title: "Stylized Character Model Pack",
    price: 45,
    description: "High-quality 3D character models",
    category: "3D Models",
    condition: "New",
    location: "Digital Download",
    seller: "GameArtStudio",
    image: "https://images.unsplash.com/photo-1636189239307-9f3a701f30a8",
    postedDate: "2026-02-18",
  },
  {
    id: "2",
    title: "Retro Pixel Art Sprite Sheet",
    price: 15,
    description: "Complete 2D sprite sheet",
    category: "2D Assets",
    condition: "New",
    location: "Digital Download",
    seller: "PixelCraftPro",
    image: "https://images.unsplash.com/photo-1758043322963-9d6f59f1509b",
    postedDate: "2026-02-17",
  },
];

interface OrderDetail {
  id: string;
  date: string;
  total: number;
  status: string;
  buyer: string;
  email: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  shipping_address?: string;
  created_at?: string;
}

// Mock Order Details
export const mockOrderDetails: Record<string, OrderDetail> = {
  "ORD-2026-001": {
    id: "ORD-2026-001",
    date: "2026-03-15",
    total: 125,
    status: "Completed",
    buyer: "John Doe",
    email: "john@example.com",
    items: [
      { name: "Character Model Pack", price: 45, quantity: 1 },
      { name: "Shader Collection", price: 28, quantity: 1 },
      { name: "UI Kit", price: 22, quantity: 2 },
    ],
  },
};

// Helper function to get reviews for a specific listing
export function getReviewsForListing(_listingId: string): Review[] {
  // In a real app, filter by listingId
  return mockReviews;
}

// Helper function to get orders for current user
export function getOrdersForUser(_userId: string): Order[] {
  // In a real app, filter by userId
  return mockOrders;
}

// Helper function to get order details
export function getOrderDetails(orderId: string): OrderDetail | null {
  return mockOrderDetails[orderId] || null;
}
