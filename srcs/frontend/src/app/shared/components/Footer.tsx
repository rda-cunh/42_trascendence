import { Link } from "react-router";
import { Gamepad2 } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Gamepad2 className="h-5 w-5 text-purple-600 dark:text-purple-500" />
            <span>&copy; {year} GameAsset Hub. All rights reserved.</span>
          </div>

          <nav aria-label="Legal" className="flex items-center gap-6 text-sm">
            <Link
              to="/privacy"
              className="text-gray-600 transition-colors hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-600 transition-colors hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
            >
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
