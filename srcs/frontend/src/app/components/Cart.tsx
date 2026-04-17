import { useCart } from "../contexts/CartContext";
import { ShoppingCart, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export function Cart() {
  const { items, removeItem, total, itemCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
        aria-label="Cart"
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
            {itemCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Cart ({itemCount})
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {items.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Your cart is empty
              </p>
            ) : (
              <>
                <div className="max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.listing.id}
                      className="flex items-center gap-3 border-b border-gray-100 p-3 last:border-0 dark:border-gray-800"
                    >
                      <img
                        src={item.listing.image}
                        alt={item.listing.title}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {item.listing.title}
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                          ${item.listing.price} × {item.quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.listing.id)}
                        className="text-gray-400 transition-colors hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 p-3 dark:border-gray-800">
                  <div className="mb-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-lg bg-purple-600 px-4 py-2 text-center text-sm text-white transition-colors hover:bg-purple-700"
                  >
                    Checkout
                  </Link>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
