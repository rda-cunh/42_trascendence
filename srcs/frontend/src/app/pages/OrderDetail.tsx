import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { getOrderDetails } from "../data/mockData";
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";

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

export function OrderDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState<Record<string, unknown> | null>(getOrderDetails(id || ""));
  const [isLoading, setIsLoading] = useState(Boolean(token && id));

  useEffect(() => {
    if (!token || !id) return;
    api
      .getOrder(id, token)
      .then((data) => {
        if (data?.order) setOrder(data.order);
      })
      .catch(() => {
        /* use mock */
      })
      .finally(() => setIsLoading(false));
  }, [id, token]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Order not found</h2>
          <Link to="/orders" className="text-purple-600 hover:underline dark:text-purple-400">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const cfg = statusConfig[order.status] || statusConfig.pending;
  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/orders"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order #{order.id}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <span
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium capitalize ${cfg.bg} ${cfg.color}`}
            >
              <Icon className="h-4 w-4" /> {order.status}
            </span>
          </div>

          <div className="p-6">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Items</h3>
            <div className="space-y-3">
              {(order.items as Array<{ name: string; quantity?: number; price: number }>)?.map(
                (item, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0 dark:border-gray-800"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity || 1}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ${order.total.toFixed(2)}
              </span>
            </div>

            {order.shipping_address && (
              <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Delivery</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {order.shipping_address}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
