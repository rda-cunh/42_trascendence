import { useCallback, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, ShoppingCart, CreditCard, MessageCircle } from "lucide-react";
import { ListingPreview } from "../components/ListingPreview";
import { useCart } from "@/app/core/contexts/CartContext";
import { useAuth } from "@/app/core/contexts/AuthContext";
import { ProductInfo } from "../components/ProductInfo";
import { ReviewSection } from "../components/ReviewSection";
import { ProductChatWidget } from "@/app/features/chat/components/ProductChatWidget";
import { useAsyncEffect } from "@/app/core/hooks/useAsyncEffect";
import { api, isDeletedListing, mapListing } from "@/app/core/lib/api";
import { getListingDescription } from "@/app/core/lib/shaders";
import { Listing, Review } from "@/app/core/types";
import { toast } from "sonner";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [chatOpen, setChatOpen] = useState(false);

  const loadProductData = useCallback(
    async ({ isCancelled }: { isCancelled: () => boolean }) => {
      if (!id) return;

      try {
        const [listingData, reviewsData] = await Promise.all([
          api.getListing(id),
          api.getReviews(id),
        ]);

        if (isCancelled()) return;

        if (isDeletedListing(listingData)) {
          setListing(null);
        } else if (listingData?.product_id || listingData?.id) {
          setListing(mapListing(listingData));
        }

        if (Array.isArray(reviewsData)) {
          setReviews(reviewsData);
        }
      } catch (err) {
        console.error("Failed to load listing:", err);
      }
    },
    [id]
  );

  const isLoading = useAsyncEffect(loadProductData, [loadProductData], {
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!listing) return;
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }
    // Prevent adding own listing
    const isOwner = user && listing.seller_id && String(user.id) === String(listing.seller_id);
    if (isOwner) {
      toast.error("You cannot add your own listing to cart. Use Edit to update it.");
      return;
    }
    addItem(listing);
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    if (!listing) return;
    if (!user) {
      toast.error("Please login to purchase");
      navigate("/login");
      return;
    }
    // Prevent buying own listing
    const isOwner = user && listing.seller_id && String(user.id) === String(listing.seller_id);
    if (isOwner) {
      toast.error("You cannot purchase your own listing. Use Edit to manage it.");
      return;
    }
    addItem(listing);
    navigate("/checkout");
  };

  const handleDelete = async () => {
    if (!listing) return;
    if (!user || String(user.id) !== String(listing.seller_id)) {
      toast.error("You are not allowed to delete this listing");
      return;
    }

    if (!window.confirm("Delete this listing? This action cannot be undone.")) return;

    try {
      await api.deleteListing(listing.id);
      toast.success("Listing deleted");
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete listing");
    }
  };

  const handleReviewsChanged = () => {
    void loadProductData({ isCancelled: () => false });
  };

  if (isLoading) {
    return (
      <div className="app-page flex items-center justify-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">Loading asset...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Asset not found</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            The asset you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = listing?.rating ?? 0;
  const reviewCount = listing?.review_count ?? reviews.length;
  const description = getListingDescription(listing);

  return (
    <div className="app-page">
      <div className="app-container">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Browse
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Preview */}
          <div className="surface overflow-hidden">
            <ListingPreview key={listing.id} listing={listing} />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <ProductInfo listing={listing} averageRating={avgRating} reviewCount={reviewCount} />

            <div className="flex gap-3">
              {user && listing.seller_id && String(user.id) === String(listing.seller_id) ? (
                <>
                  <Link to={`/listing/${listing.id}/edit`} className="btn-primary flex-1 px-6 py-3">
                    Edit
                  </Link>
                  <button onClick={handleDelete} className="btn-secondary px-6 py-3">
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleBuyNow} className="btn-primary flex-1 px-6 py-3">
                    <CreditCard className="h-5 w-5" />
                    <span>Buy Now</span>
                  </button>
                  <button onClick={handleAddToCart} className="btn-secondary px-6 py-3">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="hidden sm:inline">Add to Cart</span>
                  </button>
                  <button
                    onClick={() => setChatOpen(true)}
                    className="ml-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </button>
                </>
              )}
            </div>

            {/* Description */}
            <div className="surface-padded">
              <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">Description</h2>
              <p className="leading-relaxed text-gray-700 dark:text-gray-300">{description}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection
          listingId={id || ""}
          reviews={reviews}
          isLoggedIn={!!user}
          currentUser={user}
          onReviewsChanged={handleReviewsChanged}
        />

        <ProductChatWidget
          listingId={listing?.id ? Number(listing.id) : null}
          sellerId={listing?.seller_id ? Number(listing.seller_id) : null}
          sellerName={listing?.seller}
          productTitle={listing?.title}
          open={chatOpen}
          onOpenChange={setChatOpen}
        />
      </div>
    </div>
  );
}
