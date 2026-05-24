import { Star } from "lucide-react";
import { useState } from "react";

interface ReviewStarsProps {
  rating?: number;
  maxStars?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

export function ReviewStars({
  rating = 0,
  maxStars = 5,
  interactive = false,
  onRate,
  size = "md",
}: ReviewStarsProps) {
  const [hovered, setHovered] = useState(0);
  const sizeClasses = { sm: "w-3 h-3", md: "w-5 h-5", lg: "w-6 h-6" };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = interactive ? i < (hovered || rating) : i < rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(i + 1)}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(0)}
            className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-colors`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-none text-gray-300 dark:text-gray-600"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
