import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/app/core/lib/api";
import { useCart } from "@/app/core/contexts/CartContext";
import { useAuth } from "@/app/core/contexts/AuthContext";

const PENDING_STRIPE_ORDER_KEY = "pending_stripe_order";

function buildFailureUrl(reason: string) {
  return `/orders/fail?reason=${encodeURIComponent(reason)}`;
}

interface PendingStripeOrder {
  user_id: number;
  items: Array<{
    product_id: number;
    qty: number;
  }>;
}

export function CheckoutSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { clear } = useCart();
  const { user, token, loading } = useAuth();
  const sessionId = params.get("session_id");

  useEffect(() => {
    if (loading) return;

    let isActive = true;

    const finalizeOrder = async () => {
      if (!sessionId) {
        navigate(buildFailureUrl("Missing checkout session id."), { replace: true });
        return;
      }

      if (!token || !user?.id) {
        navigate(buildFailureUrl("You must be signed in to complete checkout."), {
          replace: true,
        });
        return;
      }

      const rawPayload = sessionStorage.getItem(PENDING_STRIPE_ORDER_KEY);
      if (!rawPayload) {
        navigate(buildFailureUrl("Missing pending checkout data."), { replace: true });
        return;
      }

      let payload: PendingStripeOrder;
      try {
        payload = JSON.parse(rawPayload) as PendingStripeOrder;
      } catch {
        sessionStorage.removeItem(PENDING_STRIPE_ORDER_KEY);
        navigate(buildFailureUrl("Invalid pending checkout data."), { replace: true });
        return;
      }

      if (!payload.user_id || !Array.isArray(payload.items) || payload.items.length === 0) {
        sessionStorage.removeItem(PENDING_STRIPE_ORDER_KEY);
        navigate(buildFailureUrl("Checkout data is incomplete."), { replace: true });
        return;
      }

      if (String(payload.user_id) !== String(user.id)) {
        sessionStorage.removeItem(PENDING_STRIPE_ORDER_KEY);
        navigate(buildFailureUrl("Checkout user does not match the signed-in account."), {
          replace: true,
        });
        return;
      }

      try {
        const createdOrder = await api.createOrder(payload);
        const orderId = createdOrder?.id;

        if (!orderId) {
          throw new Error("Order was created without an id");
        }

        await api.updateOrder(orderId, { status: "Done" });

        sessionStorage.removeItem(PENDING_STRIPE_ORDER_KEY);
        clear();
        toast.success("Order created successfully");

        if (isActive) {
          navigate("/orders", { replace: true });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create order after payment";
        if (isActive) {
          navigate(buildFailureUrl(message), { replace: true });
        }
      }
    };

    void finalizeOrder();

    return () => {
      isActive = false;
    };
  }, [sessionId, navigate, clear, user, token, loading]);

  return (
    <div className="app-page flex items-center justify-center">
      <div className="surface-padded max-w-md text-center">
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-600" />
        <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Finalizing payment
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          We are creating your order and redirecting you to your purchases.
        </p>
      </div>
    </div>
  );
}