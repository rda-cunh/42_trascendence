import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items?: any[];
}

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  processing: { icon: Package, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  shipped: { icon: Truck, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
  completed: { icon: CheckCircle, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" },
  cancelled: { icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
};

// Mock orders since backend is hardcoded
const mockOrders: Order[] = [
  { id: "ord-001", status: "completed", total: 45, created_at: "2026-03-20T10:30:00Z", items: [{ name: "Stylized Character Model Pack", price: 45 }] },
  { id: "ord-002", status: "processing", total: 63, created_at: "2026-03-25T14:20:00Z", items: [{ name: "PBR Texture Pack - Sci-Fi", price: 35 }, { name: "Retro Pixel Art Sprite Sheet", price: 28 }] },
  { id: "ord-003", status: "pending", total: 28, created_at: "2026-03-29T09:00:00Z", items: [{ name: "Holographic Shader Collection", price: 28 }] },
];

export function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    api.getOrders(token)
      .then((data) => {
        if (data?.results) setOrders(data.results);
      })
      .catch(() => { /* use mock data */ })
      .finally(() => setIsLoading(false));
  }, [token]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Orders</h1>

        {isLoading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Browse our marketplace and find something amazing!</p>
            <Link to="/" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Browse Assets
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const cfg = statusConfig[order.status] || statusConfig.pending;
              const Icon = cfg.icon;
              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${cfg.bg}`}>
                        <Icon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Order #{order.id}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${cfg.bg} ${cfg.color}`}>
                        {order.status}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">${order.total.toFixed(2)}</span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
