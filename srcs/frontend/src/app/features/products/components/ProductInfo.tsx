import { User, Calendar, Tag, Package } from "lucide-react";
import { Link } from "react-router";
import { ReviewStars } from "./ReviewStars";
import { Listing } from "@/app/core/types";
import { usePresence } from "@/app/core/contexts/PresenceContext";

interface ProductInfoProps {
  listing: Listing;
  averageRating: number;
  reviewCount: number;
}

export function ProductInfo({ listing, averageRating, reviewCount }: ProductInfoProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const isSellerOnline = usePresence(listing.seller_id);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">{listing.title}</h1>
          <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
            {listing.category}
          </span>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            ${listing.price}
          </p>
        </div>
      </div>

      {/* Rating summary */}
      {reviewCount > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <ReviewStars rating={Math.round(averageRating)} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {averageRating.toFixed(1)} ({reviewCount} reviews)
          </span>
        </div>
      )}

      <div className="mb-6 space-y-4">
        {listing.fileFormat && (
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Package className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <span>
              Format: <span className="font-semibold">{listing.fileFormat}</span>
            </span>
          </div>
        )}
        {listing.engine && (
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Tag className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <span>
              Compatible: <span className="font-semibold">{listing.engine}</span>
            </span>
          </div>
        )}
        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
          <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <span className="flex items-center gap-2">
            Seller:{" "}
            {listing.seller_id ? (
              <Link
                to={`/seller/${listing.seller_id}`}
                className="flex items-center gap-2 font-semibold text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                {listing.seller}
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    isSellerOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                  title={isSellerOnline ? "Online" : "Offline"}
                />
              </Link>
            ) : (
              <span className="flex items-center gap-2 font-semibold">
                {listing.seller}
                {listing.seller_id && (
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${
                      isSellerOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                    title={isSellerOnline ? "Online" : "Offline"}
                  />
                )}
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
          <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <span>Posted on {formatDate(listing.postedDate)}</span>
        </div>
      </div>
    </div>
  );
}
