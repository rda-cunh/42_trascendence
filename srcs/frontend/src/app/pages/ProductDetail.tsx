import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, ShoppingCart, CreditCard } from "lucide-react";
import { ListingPreview } from "../components/ListingPreview";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { ProductInfo } from "../components/ProductInfo";
import { ReviewSection } from "../components/ReviewSection";
import { ProductChatWidget } from "../components/ProductChatWidget";
import { api, mapListing } from "../lib/api";
import { getListingDescription } from "../lib/shaders";
import { Listing, Review } from "../types";
import { toast } from "sonner";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [listingData, reviewsData] = await Promise.all([
          api.getListing(id),
          api.getReviews(id),
        ]);

        if (listingData?.product_id || listingData?.id) {
          setListing(mapListing(listingData));
        }

        if (Array.isArray(reviewsData)) {
          setReviews(reviewsData);
        }
      } catch (err) {
        console.error("Failed to load listing:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (!listing) return;
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
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
    addItem(listing);
    navigate("/checkout");
  };

  const handleReviewSubmitted = () => {
    // Reload reviews after new one is submitted
    if (id) {
      api.getReviews(id).then(setReviews).catch(console.error);
    }
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

  const avgRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
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
            <ProductInfo listing={listing} averageRating={avgRating} reviewCount={reviews.length} />

            <div className="flex gap-3">
              <button
                onClick={handleBuyNow}
                className="btn-primary flex-1 px-6 py-3"
              >
                <CreditCard className="h-5 w-5" />
                <span>Buy Now</span>
              </button>
              <button
                onClick={handleAddToCart}
                className="btn-secondary px-6 py-3"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline">Add to Cart</span>
              </button>
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
          onReviewSubmitted={handleReviewSubmitted}
        />

        <ProductChatWidget
          listingId={listing?.id ? Number(listing.id) : null}
          sellerId={listing?.seller_id ? Number(listing.seller_id) : null}
          sellerName={listing?.seller}
          productTitle={listing?.title}
        />
      </div>
    </div>
  );
}
