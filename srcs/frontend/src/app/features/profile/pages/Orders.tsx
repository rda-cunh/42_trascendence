import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useAuth } from "@/app/core/contexts/AuthContext";
import { api } from "@/app/core/lib/api";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChevronRight,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { Order, OrderItem } from "@/app/core/types";
import { useAsyncEffect } from "@/app/core/hooks/useAsyncEffect";
import { toast } from "sonner";

type OrdersView = "purchases" | "sales";

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

function getView(searchParams: URLSearchParams): OrdersView {
  return searchParams.get("view") === "sales" ? "sales" : "purchases";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getLineTotal(item: OrderItem) {
  return item.subtotal ?? item.price * item.quantity;
}

function getSellerItems(order: Order, sellerId: string) {
  return (order.items ?? []).filter((item) => String(item.seller_id ?? "") === String(sellerId));
}

function getSellerTotal(order: Order, sellerId: string) {
  return getSellerItems(order, sellerId).reduce((sum, item) => sum + getLineTotal(item), 0);
}

function getSellerQuantity(order: Order, sellerId: string) {
  return getSellerItems(order, sellerId).reduce((sum, item) => sum + item.quantity, 0);
}

export function Orders() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const view = getView(searchParams);

  const isLoading = useAsyncEffect(
    async ({ isCancelled }) => {
      if (!user || !token) return;

      const data =
        view === "sales" ? await api.getSoldOrders(user.id) : await api.getOrders(user.id);

      if (isCancelled()) return;
      setOrders(data);
    },
    [user, token, view],
    {
      onError: (error) => {
        console.error("Failed to load orders:", error);
        toast.error(view === "sales" ? "Failed to load sold orders" : "Failed to load orders");
      },
    }
  );

  const salesSummary = useMemo(() => {
    if (!user || view !== "sales") return null;

    return orders.reduce(
      (acc, order) => {
        const sellerItems = getSellerItems(order, user.id);
        if (sellerItems.length === 0) return acc;

        acc.gross += sellerItems.reduce((sum, item) => sum + getLineTotal(item), 0);
        acc.orders += 1;
        acc.items += sellerItems.reduce((sum, item) => sum + item.quantity, 0);
        return acc;
      },
      { gross: 0, orders: 0, items: 0 }
    );
  }, [orders, user, view]);

  if (!user) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Sign in required
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">Please log in to view your orders</p>
          <Link to="/login" className="btn-primary px-6 py-3">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="app-container-narrow">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="page-title mb-0">Orders</h1>

          <div className="inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setSearchParams({ view: "purchases" })}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                view === "purchases"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              Purchases
            </button>
            <button
              type="button"
              onClick={() => setSearchParams({ view: "sales" })}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                view === "sales"
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              Sales
            </button>
          </div>
        </div>

        {view === "sales" && salesSummary && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="surface-padded">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gross sales</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {formatMoney(salesSummary.gross)}
              </p>
            </div>

            <div className="surface-padded">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Orders sold</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {salesSummary.orders}
              </p>
            </div>

            <div className="surface-padded">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Items sold</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                {salesSummary.items}
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="py-12 text-center text-gray-500 dark:text-gray-400">
            {view === "sales" ? "Loading sold orders..." : "Loading orders..."}
          </p>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              {view === "sales" ? "No sold orders yet" : "No orders yet"}
            </h2>
            <p className="mb-4 text-gray-500 dark:text-gray-400">
              {view === "sales"
                ? "Your sold orders will appear here after buyers complete checkout."
                : "Browse our marketplace and find something amazing!"}
            </p>
            <Link to={view === "sales" ? "/sell" : "/"} className="btn-primary px-6 py-3">
              {view === "sales" ? "Create Listing" : "Browse Assets"}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const cfg = statusConfig[order.status] || statusConfig.pending;
              const Icon = cfg.icon;
              const sellerTotal = view === "sales" ? getSellerTotal(order, user.id) : order.total;
              const sellerQuantity =
                view === "sales"
                  ? getSellerQuantity(order, user.id)
                  : (order.items ?? []).reduce((sum, item) => sum + item.quantity, 0);

              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}${view === "sales" ? "?view=sales" : ""}`}
                  className="surface-interactive block p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className={`rounded-lg p-2 ${cfg.bg}`}>
                        <Icon className={`h-5 w-5 ${cfg.color}`} />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {view === "sales" ? "Sold order" : "Order"} #{order.id}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(order.created_at)}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {sellerQuantity} item{sellerQuantity === 1 ? "" : "s"}
                          {view === "sales" ? " sold" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${cfg.bg} ${cfg.color}`}
                      >
                        {order.status}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatMoney(sellerTotal)}
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