import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, ShoppingCart, CreditCard, X } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ShaderPreview } from "../components/ShaderPreview";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { ProductInfo } from "../components/ProductInfo";
import { ReviewSection } from "../components/ReviewSection";
import { api, mapListing } from "../lib/api";
import { getListingDescription, isShaderListing } from "../lib/shaders";
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
  const [activePreview, setActivePreview] = useState<string | null>(null);

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
  const hasShaderPreview = isShaderListing(listing);
  const description = getListingDescription(listing);
  const galleryImages = listing.images ?? [];

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
            <div className="aspect-square">
              {hasShaderPreview ? (
                <ShaderPreview
                  fragmentShader={listing.shader.code}
                  label={`${listing.title} shader preview`}
                  className="h-full w-full"
                />
              ) : (
                <ImageWithFallback
                  src={listing.image}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
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

        {activePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="relative max-h-[90vh] max-w-[90vw]">
              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              >
                <X className="h-5 w-5" />
              </button>

              <ImageWithFallback
                src={`/images/${activePreview}`}
                alt={`${listing.title} preview`}
                className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
              />
            </div>

            <button
              type="button"
              onClick={() => setActivePreview(null)}
              className="absolute inset-0 -z-10 cursor-default"
              aria-label="Close image preview"
            />
          </div>
        )}

        {galleryImages.length > 0 && (
          <div className="surface-padded mt-8">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Images</h2>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {galleryImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <button
                      type="button"
                      onClick={() => setActivePreview(image)}
                      className="block aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-900"
                    >
                      <ImageWithFallback
                        src={`/images/${image}`}
                        alt={`${listing.title} preview ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <ReviewSection
          listingId={id || ""}
          reviews={reviews}
          isLoggedIn={!!user}
          onReviewSubmitted={handleReviewSubmitted}
        />
      </div>
    </div>
  );
}
