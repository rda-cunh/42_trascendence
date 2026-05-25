import { Link, useLocation } from "react-router";
import { BarChart3, Package, Users } from "lucide-react";
import { ROUTES } from "@/app/shared/utils/constants";

const tabs = [
  { path: ROUTES.ADMIN, label: "Dashboard", icon: BarChart3 },
  { path: ROUTES.ADMIN_USERS, label: "Users", icon: Users },
  { path: ROUTES.ADMIN_LISTINGS, label: "Listings", icon: Package },
] as const;

export function AdminNav() {
  const location = useLocation();

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-gray-200 pb-4 dark:border-gray-800">
      {tabs.map(({ path, label, icon: Icon }) => {
        const isActive = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
