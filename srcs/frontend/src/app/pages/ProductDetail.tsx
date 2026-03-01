import { useParams, Link } from "react-router";
import { mockListings } from "../data/mockListings";
import { MapPin, User, Calendar, Tag, Package, ArrowLeft, MessageCircle, Download } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function ProductDetail() {
  const { id } = useParams();
  const listing = mockListings.find((item) => item.id === id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Asset not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The asset you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
            <div className="aspect-square">
              <ImageWithFallback
                src={listing.image}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {listing.title}
                  </h1>
                  <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-sm">
                    {listing.category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">${listing.price}</p>
                </div>
              </div>

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
                <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Download className="w-5 h-5" />
                  <span>Purchase & Download</span>
                </button>
                <button className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{listing.description}</p>
            </div>

            {/* License Info */}
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
      </div>
    </div>
  );
}