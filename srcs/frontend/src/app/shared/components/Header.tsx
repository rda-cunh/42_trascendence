import { Link, useLocation } from "react-router";
import {
  Gamepad2,
  PlusCircle,
  Moon,
  Sun,
  LogIn,
  LogOut,
  MessageCircle,
  Shield,
  ShoppingBag,
  Server,
} from "lucide-react";
import { ROUTES } from "@/app/shared/utils/constants";
import { useTheme } from "@/app/core/contexts/ThemeContext";
import { useAuth } from "@/app/core/contexts/AuthContext";
import { Cart } from "@/app/features/cart/components/Cart";
import { NotificationBell } from "./NotificationBell";
import { UserAvatar } from "./UserAvatar";

export function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 whitespace-nowrap transition-opacity hover:opacity-80"
          >
            <Gamepad2 className="h-8 w-8 text-purple-600 dark:text-purple-500" />
            <span className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-white">
              GameAsset Hub
            </span>
          </Link>

          <nav className="flex w-full flex-wrap items-center gap-1 overflow-x-hidden sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-2">
            {user && (
              <Link
                to="/sell"
                className={`btn h-10 px-3 ${
                  location.pathname === "/sell"
                    ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <PlusCircle className="h-5 w-5" />
                <span className="hidden sm:inline">Sell</span>
              </Link>
            )}

            {user && <Cart />}
            {user && <NotificationBell />}

            {user && (
              <Link
                to={ROUTES.ORDERS}
                className={`btn-icon ${
                  location.pathname.startsWith("/orders")
                    ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    : ""
                }`}
                title="My Orders"
              >
                <ShoppingBag className="h-5 w-5" />
              </Link>
            )}

            {user && (
              <Link
                to="/chat"
                className={`btn-icon ${
                  location.pathname === "/chat"
                    ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    : ""
                }`}
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
            )}

            <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle theme">
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link to="/profile" className="btn-ghost h-10 gap-3 px-2.5 pr-4">
                  <UserAvatar
                    userId={user.id}
                    src={user.avatar_url}
                    name={user.name || user.email}
                    sizeClassName="h-7 w-7"
                  />
                  <span className="hidden text-sm font-medium md:inline">
                    {user.name || user.email}
                  </span>
                </Link>
                {user.role === "admin" && (
                  <>
                    <Link to="/admin" className="btn-icon" title="Admin Panel">
                      <Shield className="h-5 w-5" />
                    </Link>
                    <a href="/metrics/" className="btn-icon" title="Metrics">
                      <Server className="h-5 w-5" />
                    </a>
                  </>
                )}
                <button
                  onClick={() => {
                    void logout();
                  }}
                  className="btn-icon"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary h-10">
                <LogIn className="h-5 w-5" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
