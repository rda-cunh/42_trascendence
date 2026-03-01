import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { ProductDetail } from "./pages/ProductDetail";
import { SellItem } from "./pages/SellItem";
import { Header } from "./components/Header";

// Root layout component
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
    path: "/product/:id",
    element: (
      <Layout>
        <ProductDetail />
      </Layout>
    ),
  },
  {
    path: "/sell",
    element: (
      <Layout>
        <SellItem />
      </Layout>
    ),
  },
  {
    path: "*",
    element: (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
            <p className="text-gray-600">Page not found</p>
          </div>
        </div>
      </Layout>
    ),
  },
]);