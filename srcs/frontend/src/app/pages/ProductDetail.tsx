import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Listing } from "../data/mockListings";
import { MapPin, User, Calendar, Tag, Package, ArrowLeft, MessageCircle, Download, ShoppingCart, CreditCard, Star } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { ReviewStars } from "../components/ReviewStars";
import { toast } from "sonner";

interface Review {
  id: string;
  user: string;
  rating: number;
  text: string;
  date: string;
}

const mockReviews: Review[] = [
  { id: "1", user: "GameDev42", rating: 5, text: "Excellent quality! Exactly what I needed for my project.", date: "2026-03-10" },
  { id: "2", user: "PixelArtist", rating: 4, text: "Great asset, well-organized files. Would buy again.", date: "2026-03-08" },
  { id: "3", user: "UnityFan", rating: 5, text: "Perfect integration with my workflow. Highly recommended!", date: "2026-03-05" },
];

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews] = useState<Review[]>(mockReviews);
  const [newReview, setNewReview] = useState({ rating: 0, text: "" });

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/listings/${id}/`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.listing) {
          const item = data.listing;
          setListing({
            id: String(item.product_id),
            title: item.name || "Untitled",
            price: item.price || 0,
            description: item.description || "",
            category: item.category || "3D Models",
            condition: item.status || "New",
            location: "Digital Download",
            seller: "Creator Studio",
            image: item.image || "https://images.unsplash.com/photo-1636189239307-9f3a701f30a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzRCUyMGdhbWUlMjBjaGFyYWN0ZXIlMjBtb2RlbHxlbnwxfHx8fDE3NzE4MDMxNDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
            postedDate: new Date().toISOString().split('T')[0],
          });
        }
      })
      .catch(err => {
        console.error("Failed to fetch listing:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
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

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to leave a review");
      return;
    }
    if (newReview.rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    toast.success("Review submitted!");
    setNewReview({ rating: 0, text: "" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Loading asset...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Asset not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The asset you're looking for doesn't exist.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
            <div className="aspect-square">
              <ImageWithFallback src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{listing.title}</h1>
                  <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-sm">
                    {listing.category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">${listing.price}</p>
                </div>
              </div>

              {/* Rating summary */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <ReviewStars rating={Math.round(avgRating)} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {avgRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
              )}

              <div className="space-y-4 mb-6">
                {listing.fileFormat && (
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Package className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <span>Format: <span className="font-semibold">{listing.fileFormat}</span></span>
                  </div>
                )}
                {listing.engine && (
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Tag className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <span>Compatible: <span className="font-semibold">{listing.engine}</span></span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span>Seller: <span className="font-semibold">{listing.seller}</span></span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span>Posted on {formatDate(listing.postedDate)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Buy Now</span>
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="hidden sm:inline">Add to Cart</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{listing.description}</p>
            </div>

            {/* License */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 transition-colors">
              <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">License & Usage</h3>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                <li>• Personal and commercial use allowed</li>
                <li>• Cannot redistribute or resell as-is</li>
                <li>• Lifetime updates included</li>
                <li>• Email support from creator</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Reviews ({reviews.length})</h2>

          {/* Write a review */}
          <form onSubmit={handleSubmitReview} className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Leave a review</h3>
            <div className="mb-3">
              <ReviewStars rating={newReview.rating} interactive onRate={(r) => setNewReview({ ...newReview, rating: r })} size="lg" />
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={newReview.text}
                onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                placeholder="Share your experience..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
              <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm">
                Submit
              </button>
            </div>
          </form>

          {/* Reviews list */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 text-sm font-semibold">
                      {review.user.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{review.user}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(review.date)}</span>
                </div>
                <ReviewStars rating={review.rating} size="sm" />
                <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
