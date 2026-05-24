/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import { createBrowserRouter, Link, Outlet } from "react-router";
import { Home } from "./pages/Home";
import { ProductDetail } from "./pages/ProductDetail";
import { SellerProfile } from "./pages/SellerProfile";
import { SellItem } from "./pages/SellItem";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { OAuthCallback } from "./pages/OAuthCallback";
import { Profile } from "./pages/Profile";
import { Orders } from "./pages/Orders";
import { OrderDetail } from "./pages/OrderDetail";
import { Checkout } from "./pages/Checkout";
import { EditListing } from "./pages/EditListing";
import { Chat } from "./pages/Chat";
import { AdminDashboard } from "./pages/Admin/Dashboard";
import { UserManagement } from "./pages/Admin/UserManagement";
import { ListingModeration } from "./pages/Admin/ListingModeration";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleGuard } from "./components/RoleGuard";

function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 transition-colors dark:bg-gray-950">
      <Header />
      <main className="flex-1 app-container py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
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

const withAuth = (element: ReactNode) => <ProtectedRoute>{element}</ProtectedRoute>;

const withAdminAccess = (element: ReactNode) =>
  withAuth(<RoleGuard role="admin">{element}</RoleGuard>);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "login/success", element: <OAuthCallback status="success" /> },
      { path: "login/error", element: <OAuthCallback status="error" /> },
      { path: "register", element: <Register /> },
      { path: "product/:id", element: <ProductDetail /> },
      { path: "seller/:sellerId", element: <SellerProfile /> },
      { path: "sell", element: withAuth(<SellItem />) },
      { path: "listing/:id/edit", element: withAuth(<EditListing />) },
      { path: "checkout", element: withAuth(<Checkout />) },
      { path: "profile", element: withAuth(<Profile />) },
      { path: "orders", element: withAuth(<Orders />) },
      { path: "orders/:id", element: withAuth(<OrderDetail />) },
      { path: "chat", element: withAuth(<Chat />) },
      { path: "admin", element: withAdminAccess(<AdminDashboard />) },
      { path: "admin/users", element: withAdminAccess(<UserManagement />) },
      { path: "admin/listings", element: withAdminAccess(<ListingModeration />) },
      { path: "privacy", element: <PrivacyPolicy /> },
      { path: "terms", element: <TermsOfService /> },
      {
        path: "sell",
        element: (
          <ProtectedRoute>
            <SellItem />
          </ProtectedRoute>
        ),
      },
      {
        path: "listing/:id/edit",
        element: (
          <ProtectedRoute>
            <EditListing />
          </ProtectedRoute>
        ),
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "orders",
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
      {
        path: "orders/:id",
        element: (
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "chat",
        element: (
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <RoleGuard role="admin">
              <AdminDashboard />
            </RoleGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/users",
        element: (
          <ProtectedRoute>
            <RoleGuard role="admin">
              <UserManagement />
            </RoleGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/listings",
        element: (
          <ProtectedRoute>
            <RoleGuard role="admin">
              <ListingModeration />
            </RoleGuard>
          </ProtectedRoute>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
