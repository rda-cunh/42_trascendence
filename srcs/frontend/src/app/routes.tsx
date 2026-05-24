import type { ReactNode } from "react";
import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "@/app/core/components/ProtectedRoute";
import { RoleGuard } from "@/app/core/components/RoleGuard";
import { AdminDashboard } from "@/app/features/admin/pages/Dashboard";
import { ListingModeration } from "@/app/features/admin/pages/ListingModeration";
import { UserManagement } from "@/app/features/admin/pages/UserManagement";
import { Login } from "@/app/features/auth/pages/Login";
import { OAuthCallback } from "@/app/features/auth/pages/OAuthCallback";
import { Register } from "@/app/features/auth/pages/Register";
import { Chat } from "@/app/features/chat/pages/Chat";
import { Checkout } from "@/app/features/checkout/pages/Checkout";
import { EditListing } from "@/app/features/listings/pages/EditListing";
import { SellItem } from "@/app/features/listings/pages/SellItem";
import { Home } from "@/app/features/products/pages/Home";
import { ProductDetail } from "@/app/features/products/pages/ProductDetail";
import { SellerProfile } from "@/app/features/products/pages/SellerProfile";
import { OrderDetail } from "@/app/features/profile/pages/OrderDetail";
import { Orders } from "@/app/features/profile/pages/Orders";
import { Profile } from "@/app/features/profile/pages/Profile";
import { Layout, NotFound } from "@/app/shared/layout/Layout";
import { PrivacyPolicy } from "@/app/shared/pages/PrivacyPolicy";
import { TermsOfService } from "@/app/shared/pages/TermsOfService";

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
      { path: "*", element: <NotFound /> },
    ],
  },
]);
