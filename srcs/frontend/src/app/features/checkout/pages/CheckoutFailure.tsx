import { Link, useSearchParams } from "react-router";
import { AlertTriangle, ShoppingBag } from "lucide-react";

export function CheckoutFailure() {
  const [params] = useSearchParams();
  const reason = params.get("reason") ?? "Payment was cancelled or could not be confirmed.";

  return (
    <div className="app-page flex items-center justify-center">
      <div className="surface-padded max-w-md text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
        <h1 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
          Checkout not completed
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">{reason}</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/checkout" className="btn-primary px-6 py-3">
            Try again
          </Link>
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
          >
            <ShoppingBag className="h-4 w-4" />
            View orders
          </Link>
        </div>
      </div>
    </div>
  );
}