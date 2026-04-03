import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";

const mockOrders: Record<string, any> = {
  "ord-001": { id: "ord-001", status: "completed", total: 45, created_at: "2026-03-20T10:30:00Z", items: [{ name: "Stylized Character Model Pack", price: 45, quantity: 1 }], shipping_address: "Digital Delivery" },
  "ord-002": { id: "ord-002", status: "processing", total: 63, created_at: "2026-03-25T14:20:00Z", items: [{ name: "PBR Texture Pack - Sci-Fi", price: 35, quantity: 1 }, { name: "Retro Pixel Art Sprite Sheet", price: 28, quantity: 1 }], shipping_address: "Digital Delivery" },
  "ord-003": { id: "ord-003", status: "pending", total: 28, created_at: "2026-03-29T09:00:00Z", items: [{ name: "Holographic Shader Collection", price: 28, quantity: 1 }], shipping_address: "Digital Delivery" },
};

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  processing: { icon: Package, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  shipped: { icon: Truck, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
  completed: { icon: CheckCircle, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" },
  cancelled: { icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
};

export function OrderDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState<any>(mockOrders[id || ""] || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    setIsLoading(true);
    api.getOrder(id, token)
      .then((data) => { if (data?.order) setOrder(data.order); })
      .catch(() => { /* use mock */ })
      .finally(() => setIsLoading(false));
  }, [id, token]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center"><p className="text-gray-500 dark:text-gray-400">Loading...</p></div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order not found</h2>
          <Link to="/orders" className="text-purple-600 dark:text-purple-400 hover:underline">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const cfg = statusConfig[order.status] || statusConfig.pending;
  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/orders" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{order.id}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium capitalize ${cfg.bg} ${cfg.color}`}>
              <Icon className="w-4 h-4" /> {order.status}
            </span>
          </div>

          <div className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Items</h3>
            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity || 1}</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">${item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">${order.total.toFixed(2)}</span>
            </div>

            {order.shipping_address && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Delivery</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{order.shipping_address}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
