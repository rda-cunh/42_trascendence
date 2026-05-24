import { Link, Outlet } from "react-router";
import { Footer } from "@/app/shared/components/Footer";
import { Header } from "@/app/shared/components/Header";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 transition-colors dark:bg-gray-950">
      <Header />
      <main className="app-container flex-1 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900 dark:text-white">404</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">Page not found</p>
        <Link
          to="/"
          className="rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
