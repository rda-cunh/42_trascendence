import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { toast } from "sonner";

interface SellerData {
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  listings?: Array<{
    name: string;
    description?: string;
    price: number;
    images?: Array<{ image_hash: string; display_order: number }>;
  }>;
}

export function SellerProfile() {
  const { sellerId } = useParams();
  const { user } = useAuth();
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!sellerId) return;

      try {
        // Fetch seller profile and their products
        const sellerData = await api.getPublicUserProfile(sellerId);
        setSeller(sellerData);
      } catch (err) {
        console.error("Failed to load seller profile:", err);
        toast.error("Failed to load seller profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 transition-colors dark:bg-gray-950">
        <p className="text-lg text-gray-500 dark:text-gray-400">Loading seller profile...</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 transition-colors dark:bg-gray-950">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Seller not found
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            The seller you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const products = seller.listings || [];
  const isOwnProfile = user?.id === sellerId;

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Browse
        </Link>

        {/* Seller Header */}
        <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-6 bg-gradient-to-r from-purple-600 to-purple-800 p-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-4xl font-bold text-white backdrop-blur-sm">
                {seller.name?.charAt(0).toUpperCase() || "S"}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{seller.name}</h1>
                {seller.email && <p className="text-purple-200">{seller.email}</p>}
              </div>
            </div>

            {/* Follow API is not available yet. Keep CTA disabled for now. */}
            {!isOwnProfile && user && (
              <button
                disabled
                title="Follow is coming soon"
                className="rounded-lg border border-purple-200 bg-white px-6 py-3 font-medium text-purple-600 opacity-60 dark:border-purple-700 dark:bg-gray-800 dark:text-purple-400"
              >
                Follow (soon)
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 border-t border-gray-200 p-6 dark:border-gray-800 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">-</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
            </div>
            {seller.phone && (
              <div className="col-span-2 text-center sm:col-span-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Member since</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">2024</p>
              </div>
            )}
          </div>
        </div>

        {/* Products Section */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            {isOwnProfile ? "Your Products" : `${seller.name}'s Products`}
          </h2>

          {products.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
              <p className="text-gray-600 dark:text-gray-400">
                No products yet. {isOwnProfile && <Link to="/sell" className="text-purple-600 hover:text-purple-700 dark:text-purple-400">Start selling</Link>}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, idx) => (
                <Link
                  key={idx}
                  to={`/product/${idx}`}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {product.images && product.images.length > 0 ? (
                      <ImageWithFallback
                        src={`https://images.unsplash.com/photo-1636189239307-9f3a701f30a8`}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <span>No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </h3>
                    <p className="mb-3 line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
                      {product.description || "No description"}
                    </p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
