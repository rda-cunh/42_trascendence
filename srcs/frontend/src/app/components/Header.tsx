import { Link, useLocation } from "react-router";
import { Gamepad2, PlusCircle, Search, Moon, Sun, LogIn } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useState } from "react";

export function Header() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Gamepad2 className="w-8 h-8 text-purple-600 dark:text-purple-500" />
              <span className="text-xl font-semibold text-gray-900 dark:text-white">GameAsset Hub</span>
            </Link>

            <nav className="flex items-center gap-3">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === "/"
                    ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Browse</span>
              </Link>
              <Link
                to="/sell"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === "/sell"
                    ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <PlusCircle className="w-5 h-5" />
                <span className="hidden sm:inline">Sell Asset</span>
              </Link>
              
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">Login</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Login to GameAsset Hub</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Login functionality - connect to authentication service");
                    setShowLoginModal(false);
                  }}
                >
                  Login
                </button>
              </div>
            </form>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4">
              Don't have an account? <button className="text-purple-600 dark:text-purple-400 hover:underline">Sign up</button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}