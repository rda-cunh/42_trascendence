import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { ProductDetail } from "./pages/ProductDetail";
import { SellItem } from "./pages/SellItem";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { Orders } from "./pages/Orders";
import { OrderDetail } from "./pages/OrderDetail";
import { Checkout } from "./pages/Checkout";
import { EditListing } from "./pages/EditListing";
import { SearchPage } from "./pages/Search";
import { Chat } from "./pages/Chat";
import { AdminDashboard } from "./pages/Admin/Dashboard";
import { UserManagement } from "./pages/Admin/UserManagement";
import { ListingModeration } from "./pages/Admin/ListingModeration";
import { Header } from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleGuard } from "./components/RoleGuard";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Header />
      {children}
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: "/login",
    element: (
      <Layout>
        <Login />
      </Layout>
    ),
  },
  {
    path: "/register",
    element: (
      <Layout>
        <Register />
      </Layout>
    ),
  },
  {
    path: "/product/:id",
    element: (
      <Layout>
        <ProductDetail />
      </Layout>
    ),
  },
  {
    path: "/search",
    element: (
      <Layout>
        <SearchPage />
      </Layout>
    ),
  },
  {
    path: "/sell",
    element: (
      <Layout>
        <ProtectedRoute>
          <SellItem />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/listing/:id/edit",
    element: (
      <Layout>
        <ProtectedRoute>
          <EditListing />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/checkout",
    element: (
      <Layout>
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/profile",
    element: (
      <Layout>
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/orders",
    element: (
      <Layout>
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/orders/:id",
    element: (
      <Layout>
        <ProtectedRoute>
          <OrderDetail />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/chat",
    element: (
      <Layout>
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/admin",
    element: (
      <Layout>
        <ProtectedRoute>
          <RoleGuard role="admin">
            <AdminDashboard />
          </RoleGuard>
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <Layout>
        <ProtectedRoute>
          <RoleGuard role="admin">
            <UserManagement />
          </RoleGuard>
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/admin/listings",
    element: (
      <Layout>
        <ProtectedRoute>
          <RoleGuard role="admin">
            <ListingModeration />
          </RoleGuard>
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "*",
    element: (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Page not found</p>
            <a href="/" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Go Home
            </a>
          </div>
        </div>
      </Layout>
    ),
  },
]);
