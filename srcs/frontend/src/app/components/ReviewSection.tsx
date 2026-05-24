import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { ReviewStars } from "./ReviewStars";
import { api } from "../lib/api";
import { Review, User } from "../types";
import { toast } from "sonner";

interface ReviewSectionProps {
  listingId: string;
  reviews: Review[];
  isLoggedIn: boolean;
  currentUser: User | null;
  onReviewsChanged?: () => void;
}

export function ReviewSection({
  listingId,
  reviews,
  isLoggedIn,
  currentUser,
  onReviewsChanged,
}: ReviewSectionProps) {
  const [newReview, setNewReview] = useState({ rating: 0, text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error("Please login to leave a review");
      return;
    }

    if (newReview.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createReview({
        listing_id: listingId,
        rating: newReview.rating,
        title: "",
        body: newReview.text,
      });

      toast.success("Review submitted!");
      setNewReview({ rating: 0, text: "" });
      onReviewsChanged?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit review";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const canDeleteReview = (review: Review) => {
    if (!currentUser) return false;

    const isOwner = String(review.reviewer_id) === String(currentUser.id);
    const isAdmin = currentUser.role === "admin";

    return isOwner || isAdmin;
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    setDeletingReviewId(reviewToDelete.id);
    try {
      await api.deleteReview(listingId, reviewToDelete.id);
      toast.success("Review removed");
      setReviewToDelete(null);
      onReviewsChanged?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove review";
      toast.error(message);
    } finally {
      setDeletingReviewId(null);
    }
  };

  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
        Reviews ({reviews.length})
      </h2>

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
            disabled={isSubmitting}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-100 pb-4 last:border-0 dark:border-gray-800"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    {review.reviewer_name?.charAt(0) || "?"}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {review.reviewer_name || "Unknown user"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(review.created_at)}
                  </span>

                  {canDeleteReview(review) && (
                    <button
                      type="button"
                      onClick={() => setReviewToDelete(review)}
                      disabled={deletingReviewId === review.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:ring-2 focus:ring-red-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-red-900/40 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      aria-label="Remove review"
                      title="Remove review"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <ReviewStars rating={review.rating} size="sm" />
              {review.title && (
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {review.title}
                </p>
              )}
              {review.body && (
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{review.body}</p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            No reviews yet. Be the first to review this asset!
          </div>
        )}
      </div>

      {reviewToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Remove review
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  This will remove your review from the listing. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <p className="font-medium">{reviewToDelete.reviewer_name}</p>
              {reviewToDelete.body && <p className="mt-1 line-clamp-3">{reviewToDelete.body}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                disabled={deletingReviewId === reviewToDelete.id}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteReview}
                disabled={deletingReviewId === reviewToDelete.id}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {deletingReviewId === reviewToDelete.id ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
