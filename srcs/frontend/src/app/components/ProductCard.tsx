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
      className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-200"
    >
      <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <ImageWithFallback
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{listing.title}</h3>
          <span className="text-lg font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap">${listing.price}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{listing.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{listing.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(listing.postedDate)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-block px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
            {listing.category}
          </span>
          {listing.fileFormat && (
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
              {listing.fileFormat}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}