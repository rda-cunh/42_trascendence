import { Link } from "react-router";
import { MapPin, Clock } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ShaderPreview } from "./ShaderPreview";
import { Listing } from "../types";
import { getListingDescription, isShaderListing } from "../lib/shaders";

interface ProductCardProps {
  listing: Listing;
}

export function ProductCard({ listing }: ProductCardProps) {
  const hasShaderPreview = isShaderListing(listing);
  const description = getListingDescription(listing);

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
      className="surface-interactive group overflow-hidden"
    >
      <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        {hasShaderPreview ? (
          <ShaderPreview
            fragmentShader={listing.shader.code}
            label={`${listing.title} shader preview`}
            className="h-full w-full transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <ImageWithFallback
            src={listing.image}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        )}
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
        <p className="muted-text mb-3 line-clamp-2 text-sm">{description}</p>
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
          <span className="badge-primary">
            {listing.category}
          </span>
          {listing.fileFormat && (
            <span className="badge-muted">
              {listing.fileFormat}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
