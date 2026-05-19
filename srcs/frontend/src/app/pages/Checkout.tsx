import { useState } from "react";
import { useNavigate } from "react-router";
import { useCart } from "../contexts/CartContext";
import { api } from "../lib/api";
import { Trash2, CreditCard, ArrowLeft } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { resolveImageUrl } from "../lib/images";
import { toast } from "sonner";
import { Link } from "react-router";

export function Checkout() {
  const { items, removeItem, total, clear } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    try {
      await api.createOrder({
        items: items.map((i: (typeof items)[number]) => ({
          listing_id: i.listing.id,
          quantity: i.quantity,
        })),
        total,
      });

      clear();
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to place order";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="app-page flex items-center justify-center">
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
    <div className="app-page">
      <div className="app-container-narrow">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>

        <h1 className="page-title mb-8">Checkout</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="surface-padded">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                Order Summary
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.listing.id}
                    className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 dark:border-gray-800"
                  >
                    <ImageWithFallback
                      src={resolveImageUrl(item.listing.image)}
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
          </div>

          <div>
            <div className="surface-padded sticky top-24">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Payment</h2>
              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
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
                className="btn-primary w-full py-3"
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
