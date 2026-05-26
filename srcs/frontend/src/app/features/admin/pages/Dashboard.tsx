import { useEffect, useMemo, useState } from "react";
import { BarChart3, DollarSign, Package, ShoppingBag, TrendingUp, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { api, mapListing } from "@/app/core/lib/api";
import type { AdminDashboardData } from "@/app/core/lib/api";
import { CATEGORY_CHART_COLORS } from "../dashboardData";
import { AdminNav } from "../components/AdminNav";

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [dash, listingsRaw] = await Promise.all([
          api.getAdminDashboard(),
          api.getListings({ status: "Active" }),
        ]);

        if (cancelled) return;

        setDashboard(dash);

        const results = Array.isArray(listingsRaw) ? listingsRaw : listingsRaw?.results || [];
        const listings = results.map(mapListing);
        const counts = new Map<string, number>();
        for (const listing of listings) {
          const cat = listing.category || "Other";
          counts.set(cat, (counts.get(cat) ?? 0) + 1);
        }
        const total = listings.length || 1;
        const categories = Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([name, count], index) => ({
            name,
            value: Math.round((count / total) * 100),
            color: CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length],
          }));
        setCategoryData(categories.length > 0 ? categories : [{ name: "No listings", value: 100, color: "#9333ea" }]);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load dashboard";
        setError(message);
        toast.error(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.months.map((month, index) => ({
      month,
      revenue: dashboard.revenue_overview[index] ?? 0,
      orders: dashboard.orders_trend[index] ?? 0,
    }));
  }, [dashboard]);

  const stats = useMemo(() => {
    if (!dashboard) return [];
    return [
      {
        title: "Total Revenue",
        value: formatCurrency(dashboard.total_revenue),
        icon: DollarSign,
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-100 dark:bg-green-900/30",
      },
      {
        title: "Total Users",
        value: formatNumber(dashboard.total_users),
        icon: Users,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-900/30",
      },
      {
        title: "Active Listings",
        value: formatNumber(dashboard.active_listings),
        icon: Package,
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-100 dark:bg-purple-900/30",
      },
      {
        title: "Total Orders",
        value: formatNumber(dashboard.total_orders),
        icon: ShoppingBag,
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-100 dark:bg-orange-900/30",
      },
    ];
  }, [dashboard]);

  if (isLoading) {
    return (
      <div className="app-page flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="app-page">
        <div className="app-container">
          <AdminNav />
          <div className="empty-state">
            <p className="text-red-500">{error ?? "Failed to load dashboard"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="app-container">
        <AdminNav />
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-description">Overview of your marketplace</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="surface-padded">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
              </div>
            );
          })}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="surface-padded">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <BarChart3 className="h-5 w-5 text-purple-600" /> Revenue Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17,24,39,0.9)",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="revenue" fill="#9333ea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="surface-padded">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <TrendingUp className="h-5 w-5 text-purple-600" /> Orders Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(17,24,39,0.9)",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#9333ea"
                  strokeWidth={2}
                  dot={{ fill: "#9333ea" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {categoryData.length > 0 && (
          <div className="surface-padded">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              Category Distribution (active listings)
            </h3>
            <div className="flex flex-col items-center gap-8 md:flex-row">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17,24,39,0.9)",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {cat.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
