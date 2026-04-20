import { Link } from "react-router";
import { MapPin, Clock } from "lucide-react";
import { Listing } from "../data/mockListings";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProductCardProps {
  listing: Listing;
}

export function ProductCard({ listing }: ProductCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Link
      to={`/product/${listing.id}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-purple-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-purple-500"
    >
      <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <ImageWithFallback
          src={listing.image}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-gray-900 dark:text-white">
            {listing.title}
          </h3>
          <span className="text-lg font-bold whitespace-nowrap text-purple-600 dark:text-purple-400">
            ${listing.price}
          </span>
        </div>
        <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {listing.description}
        </p>
        <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{listing.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(listing.postedDate)}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block rounded bg-purple-100 px-2 py-1 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            {listing.category}
          </span>
          {listing.fileFormat && (
            <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {listing.fileFormat}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
