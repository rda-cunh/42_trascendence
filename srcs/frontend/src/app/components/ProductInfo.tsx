import { MapPin, User, Calendar, Tag, Package } from "lucide-react";
import { Listing } from "../data/mockListings";
import { ReviewStars } from "./ReviewStars";

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
          <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <span>{listing.location}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
          <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <span>
            Seller: <span className="font-semibold">{listing.seller}</span>
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
