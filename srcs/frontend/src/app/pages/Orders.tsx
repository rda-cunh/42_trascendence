import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { mockOrders } from "../data/mockData";
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items?: Array<Record<string, unknown>>;
}

const statusConfig: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  pending: {
    icon: Clock,
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  processing: {
    icon: Package,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  shipped: {
    icon: Truck,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  completed: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  cancelled: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
};

export function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>(
    mockOrders.map((o) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      created_at: new Date(o.date).toISOString(),
      items: [],
    }))
  );
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;
    api
      .getOrders(token)
      .then((data) => {
        if (data?.results) setOrders(data.results);
      })
      .catch(() => {
        /* use mock data */
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>

        {isLoading ? (
          <p className="py-12 text-center text-gray-500 dark:text-gray-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              No orders yet
            </h2>
            <p className="mb-4 text-gray-500 dark:text-gray-400">
              Browse our marketplace and find something amazing!
            </p>
            <Link
              to="/"
              className="rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
            >
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
                  className="block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`rounded-lg p-2 ${cfg.bg}`}>
                        <Icon className={`h-5 w-5 ${cfg.color}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Order #{order.id}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${cfg.bg} ${cfg.color}`}
                      >
                        {order.status}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ${order.total.toFixed(2)}
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
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
