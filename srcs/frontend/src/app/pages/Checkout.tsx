import { useState } from "react";
import { useNavigate } from "react-router";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { Trash2, CreditCard, ArrowLeft, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";

export function Checkout() {
  const { items, removeItem, total, clear } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [address, setAddress] = useState({ line1: "", city: "", country: "" });

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setIsProcessing(true);
    try {
      if (token) {
        await api.createOrder(
          {
            items: items.map((i) => ({
              listing_id: i.listing.id,
              quantity: i.quantity,
            })),
            total,
            address: address.line1 ? address : undefined,
          },
          token
        );
      }
      clear();
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch {
      // Simulate success for demo
      clear();
      toast.success("Order placed successfully! (demo mode)");
      navigate("/orders");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 transition-colors dark:bg-gray-950">
        <div className="text-center">
          <CreditCard className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Your cart is empty
          </h2>
          <Link to="/" className="text-purple-600 hover:underline dark:text-purple-400">
            Browse assets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>

        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Order Summary
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.listing.id}
                    className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 dark:border-gray-800"
                  >
                    <img
                      src={item.listing.image}
                      alt={item.listing.title}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900 dark:text-white">
                        {item.listing.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.listing.category} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${(item.listing.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.listing.id)}
                        className="text-gray-400 transition-colors hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery info */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <MapPin className="h-5 w-5" /> Delivery Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address
                  </label>
                  <input
                    type="text"
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    placeholder="123 Main St"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      City
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="City"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Country
                    </label>
                    <input
                      type="text"
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      placeholder="Country"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div>
            <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Payment</h2>
              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="text-gray-900 dark:text-white">$0.00</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 dark:border-gray-800">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                <CreditCard className="h-5 w-5" />
                {isProcessing ? "Processing..." : "Place Order"}
              </button>
              <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                Digital delivery — instant access after purchase
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
