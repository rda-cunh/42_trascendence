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
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { Cart } from "./Cart";
import { NotificationBell } from "./NotificationBell";

export function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Gamepad2 className="h-8 w-8 text-purple-600 dark:text-purple-500" />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              GameAsset Hub
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {user && (
              <Link
                to="/sell"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                  location.pathname === "/sell"
                    ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
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
                to="/chat"
                className={`rounded-lg p-2 transition-colors ${
                  location.pathname === "/chat"
                    ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
            )}

            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden text-sm font-medium md:inline">
                    {user.name || user.email}
                  </span>
                </Link>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    title="Admin Panel"
                  >
                    <Shield className="h-5 w-5" />
                  </Link>
                )}
                <button
                  onClick={() => {
                    void logout();
                  }}
                  className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
              >
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
