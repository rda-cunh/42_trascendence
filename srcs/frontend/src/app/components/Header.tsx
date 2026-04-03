import { Link, useLocation } from "react-router";
import { Gamepad2, PlusCircle, Search, Moon, Sun, LogIn, LogOut, User, MessageCircle, ShoppingCart, Shield } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { Cart } from "./Cart";
import { NotificationBell } from "./NotificationBell";

export function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Gamepad2 className="w-8 h-8 text-purple-600 dark:text-purple-500" />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">GameAsset Hub</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              to="/search"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === "/" || location.pathname === "/search"
                  ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">Browse</span>
            </Link>

            {user && (
              <Link
                to="/sell"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === "/sell"
                    ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <PlusCircle className="w-5 h-5" />
                <span className="hidden sm:inline">Sell</span>
              </Link>
            )}

            {user && <Cart />}
            {user && <NotificationBell />}

            {user && (
              <Link
                to="/chat"
                className={`p-2 rounded-lg transition-colors ${
                  location.pathname === "/chat"
                    ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <MessageCircle className="w-5 h-5" />
              </Link>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-sm font-medium">{user.name}</span>
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Admin Panel"
                  >
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
