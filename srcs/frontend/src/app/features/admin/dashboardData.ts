import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";

export const revenueData = [
  { month: "Jan", revenue: 4200, orders: 45 },
  { month: "Feb", revenue: 5800, orders: 62 },
  { month: "Mar", revenue: 7200, orders: 78 },
  { month: "Apr", revenue: 6100, orders: 55 },
  { month: "May", revenue: 8500, orders: 92 },
  { month: "Jun", revenue: 9800, orders: 105 },
];

export const categoryData = [
  { name: "3D Models", value: 35, color: "#9333ea" },
  { name: "2D Assets", value: 25, color: "#a855f7" },
  { name: "Shaders", value: 15, color: "#c084fc" },
  { name: "Textures", value: 12, color: "#d8b4fe" },
  { name: "VFX", value: 8, color: "#e9d5ff" },
  { name: "Other", value: 5, color: "#f3e8ff" },
];

export const stats = [
  {
    title: "Total Revenue",
    value: "$41,600",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    title: "Total Users",
    value: "2,847",
    change: "+8.2%",
    icon: Users,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "Active Listings",
    value: "1,234",
    change: "+15.3%",
    icon: Package,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    title: "Total Orders",
    value: "437",
    change: "+6.7%",
    icon: ShoppingBag,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
];
