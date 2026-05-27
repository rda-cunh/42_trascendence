/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router";
import { useAuth } from "@/app/core/contexts/AuthContext";
import { api } from "@/app/core/lib/api";
import { ArrowLeft, Clock, CheckCircle, Truck, XCircle, Package } from "lucide-react";
import { Listing, Order, OrderItem } from "@/app/core/types";
import { toast } from "sonner";
import { useAsyncEffect } from "@/app/core/hooks/useAsyncEffect";
import { mapListing } from "@/app/core/lib/api";
import { isShaderListing } from "@/app/core/lib/shaders";

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

function getLineTotal(item: OrderItem) {
  return item.subtotal ?? item.price * item.quantity;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [purchasedListings, setPurchasedListings] = useState<Record<string, Listing>>({});

  const view = getView(searchParams);

  const isLoading = useAsyncEffect(
    async ({ isCancelled }) => {
      if (!user || !id) return;

      const data = await api.getOrder(id);

      if (isCancelled()) return;

      setOrder(data);

      const productIds = Array.from(
        new Set(
          (data.items ?? [])
            .map((item: any) => String(item.product_id ?? ""))
            .filter((value: string) => value.length > 0)
        )
      );

      const listingEntries = await Promise.all(
        productIds.map(async (productId) => {
          try {
            const listingData = await api.getListing(productId);
            if (!listingData?.id && !listingData?.product_id) return null;
            return [productId, mapListing(listingData)] as const;
          } catch {
            return null;
          }
        })
      );

      if (isCancelled()) return;

      setPurchasedListings(
        Object.fromEntries(
          listingEntries.filter((entry): entry is readonly [string, Listing] => Boolean(entry))
        )
      );
    },
    [id, user],
    {
      onError: (error) => {
        console.error("Failed to load order:", error);
        toast.error("Failed to load order");
      },
    }
  );

  const visibleItems = useMemo(() => {
    if (!order) return [];
    if (view !== "sales" || !user?.id) return order.items ?? [];

    return (order.items ?? []).filter(
      (item) => String(item.seller_id ?? "") === String(user.id)
    );
  }, [order, user?.id, view]);

  const enrichedItems = useMemo(() => {
    return visibleItems.map((item) => {
      const listing = purchasedListings[String(item.product_id)];
      return {
        item,
        listing,
      };
    });
  }, [visibleItems, purchasedListings]);

  const visibleTotal = useMemo(() => {
    if (!order) return 0;
    if (view !== "sales") return order.total;

    return visibleItems.reduce((sum, item) => sum + getLineTotal(item), 0);
  }, [order, view, visibleItems]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 transition-colors dark:bg-gray-950">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Sign in required
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">Please log in to view orders</p>
          <Link
            to="/login"
            className="rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

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
  const backHref = view === "sales" ? "/orders?view=sales" : "/orders";

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to={backHref}
          className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Link>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {view === "sales" ? "Sold order" : "Order"} #{order.id}
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
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              {view === "sales" ? "Items sold" : "Items"}
            </h3>

            {enrichedItems.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No items from this order belong to your seller account.
              </p>
            ) : (
              <div className="space-y-4">
                {enrichedItems.map(({ item, listing }) => {
                  const isShader = listing ? isShaderListing(listing) : false;
                  const shaderCode = isShader ? listing.shader.code : null;
                  const lineTotal = getLineTotal(item);

                  return (
                    <div
                      key={item.id}
                      className="border-b border-gray-100 py-4 last:border-0 dark:border-gray-800"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.name || `Item ${item.id}`}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity} x {formatMoney(item.price)}
                          </p>
                        </div>

                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatMoney(lineTotal)}
                        </p>
                      </div>

                      {shaderCode && (
                        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="border-b border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300">
                            Shader Code
                          </div>
                          <pre className="overflow-x-auto bg-gray-950 p-4 text-sm text-gray-100">
                            <code>{shaderCode}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {view === "sales" ? "Cash total" : "Total"}
              </span>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatMoney(visibleTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}