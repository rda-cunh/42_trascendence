import { useState } from "react";
import { ReviewStars } from "./ReviewStars";
import { Review } from "../data/mockData";
import { toast } from "sonner";

interface ReviewSectionProps {
  reviews: Review[];
  isLoggedIn: boolean;
  onSubmitReview?: (rating: number, text: string) => void;
}

export function ReviewSection({ reviews, isLoggedIn, onSubmitReview }: ReviewSectionProps) {
  const [newReview, setNewReview] = useState({ rating: 0, text: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error("Please login to leave a review");
      return;
    }

    if (newReview.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (onSubmitReview) {
      onSubmitReview(newReview.rating, newReview.text);
    }

    toast.success("Review submitted!");
    setNewReview({ rating: 0, text: "" });
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
        Reviews ({reviews.length})
      </h2>

      {/* Write a review */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 border-b border-gray-200 pb-6 dark:border-gray-800"
      >
        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Leave a review
        </h3>
        <div className="mb-3">
          <ReviewStars
            rating={newReview.rating}
            interactive
            onRate={(r) => setNewReview({ ...newReview, rating: r })}
            size="lg"
          />
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={newReview.text}
            onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
            placeholder="Share your experience..."
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-100 pb-4 last:border-0 dark:border-gray-800"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  {review.user.charAt(0)}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{review.user}</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(review.date)}
              </span>
            </div>
            <ReviewStars rating={review.rating} size="sm" />
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
