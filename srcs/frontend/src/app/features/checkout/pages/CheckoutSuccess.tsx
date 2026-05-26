import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, Loader2 } from "lucide-react";

function buildFailureUrl(reason: string) {
  return `/orders/fail?reason=${encodeURIComponent(reason)}`;
}

export function CheckoutSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session_id");

  useEffect(() => {
    if (!sessionId) {
      navigate(buildFailureUrl("Missing checkout session id."), { replace: true });
      return;
    }

    const timer = window.setTimeout(() => {
      navigate("/orders", { replace: true });
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [sessionId, navigate]);

  const isLoading = true;

  return (
    <div className="app-page flex items-center justify-center">
      <div className="surface-padded max-w-md text-center">
        {isLoading ? (
          <>
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-600" />
            <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
              Finalizing payment
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              We are confirming your Stripe session and creating the order.
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
            <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
              Payment confirmed
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting you to your orders.
            </p>
          </>
        )}
      </div>
    </div>
  );
}