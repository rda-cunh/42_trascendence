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
        className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Cart"
      >
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Cart ({itemCount})</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            {items.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">Your cart is empty</p>
            ) : (
              <>
                <div className="max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.listing.id} className="p-3 border-b border-gray-100 dark:border-gray-800 last:border-0 flex items-center gap-3">
                      <img src={item.listing.image} alt={item.listing.title} className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.listing.title}</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">${item.listing.price} × {item.quantity}</p>
                      </div>
                      <button onClick={() => removeItem(item.listing.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={() => setOpen(false)}
                    className="block w-full text-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
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
