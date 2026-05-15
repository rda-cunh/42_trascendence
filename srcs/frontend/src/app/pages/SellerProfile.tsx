import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ProductCard } from "../components/ProductCard";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { api, mapListing } from "../lib/api";
import { resolveImageUrl } from "../lib/images";
import { Listing } from "../types";
import { toast } from "sonner";

interface SellerData {
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  listings?: Array<Record<string, unknown>>;
}

export function SellerProfile() {
  const { sellerId } = useParams();
  const { user } = useAuth();
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [products, setProducts] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!sellerId) return;

      try {
        const sellerData = await api.getPublicUserProfile(sellerId);
        const listings = Array.isArray(sellerData?.listings) ? sellerData.listings : [];
        setSeller(sellerData);
        setProducts(listings.map(mapListing));
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
      <div className="app-page flex items-center justify-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">Loading seller profile...</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Seller not found
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            The seller you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn-primary inline-flex">
            <ArrowLeft className="h-4 w-4" /> Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === sellerId;
  const initials = seller.name?.charAt(0).toUpperCase() || "S";

  return (
    <div className="app-page">
      <div className="app-container">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Browse
        </Link>

        <div className="surface mb-8 overflow-hidden">
          <div className="flex flex-col gap-6 bg-gradient-to-r from-purple-600 to-purple-800 p-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-6">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 text-4xl font-bold text-white backdrop-blur-sm">
                {seller.avatar_url ? (
                  <ImageWithFallback
                    src={resolveImageUrl(seller.avatar_url)}
                    alt={seller.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <h1 className="break-words text-3xl font-bold text-white">{seller.name}</h1>
                {seller.email && <p className="break-words text-purple-200">{seller.email}</p>}
              </div>
            </div>

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
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {seller.phone}
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            {isOwnProfile ? "Your Products" : `${seller.name}'s Products`}
          </h2>

          {products.length === 0 ? (
            <div className="empty-state">
              <p className="text-gray-600 dark:text-gray-400">
                No products yet.{" "}
                {isOwnProfile && (
                  <Link to="/sell" className="text-purple-600 hover:text-purple-700 dark:text-purple-400">
                    Start selling
                  </Link>
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} listing={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
