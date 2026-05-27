import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, CreditCard, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/core/contexts/AuthContext";
import { useCart } from "@/app/core/contexts/CartContext";
import { api } from "@/app/core/lib/api";
import { ImageWithFallback } from "@/app/shared/components/figma/ImageWithFallback";
import { resolveImageUrl } from "@/app/core/lib/images";

const PENDING_STRIPE_ORDER_KEY = "pending_stripe_order";

export function CheckoutRedirect() {
  const { items, removeItem, total } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartCheckout = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!user?.id) {
      toast.error("You must be signed in to place an order");
      return;
    }

    setIsProcessing(true);

    try {
      const orderPayload = {
        user_id: Number(user.id),
        items: items.map((item) => ({
          product_id: Number(item.listing.id),
          qty: item.quantity,
        })),
      };

      sessionStorage.setItem(PENDING_STRIPE_ORDER_KEY, JSON.stringify(orderPayload));

      const { checkout_url } = await api.createCheckout({
        items: items.map((item) => ({
          id: Number(item.listing.id),
          quantity: item.quantity,
        })),
      });

      window.location.assign(checkout_url);
    } catch (error) {
      sessionStorage.removeItem(PENDING_STRIPE_ORDER_KEY);
      const message = error instanceof Error ? error.message : "Failed to start checkout";
      toast.error(message);
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

          <aside className="surface-padded sticky top-6 h-fit">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Secure checkout
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You will complete payment on Stripe and return here after authorization.
                </p>
              </div>
            </div>

            <div className="space-y-3 border-b border-gray-100 pb-4 text-sm dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Items</span>
                <span className="font-medium text-gray-900 dark:text-white">{items.length}</span>
              </div>
              <div className="flex items-center justify-between text-base">
                <span className="font-medium text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartCheckout}
              disabled={isProcessing}
              className="btn-primary mt-6 flex w-full items-center justify-center gap-2 px-6 py-3 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing checkout
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Continue to Stripe
                </>
              )}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}