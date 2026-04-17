import { useState } from "react";
import { Link } from "react-router";
import { ProductCard } from "../components/ProductCard";
import { Listing } from "../data/mockListings";
import { useFetch } from "../hooks/useFetch";
import { Search, SlidersHorizontal, ArrowRight } from "lucide-react";

interface ListingsData {
  results?: Array<{
    product_id: string | number;
    name?: string;
    price?: number;
    description?: string;
    category?: string;
    status?: string;
    image?: string;
  }>;
}

export function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [listings, setListings] = useState<Listing[]>([]);

  // Use custom hook for data fetching
  const { isLoading } = useFetch<ListingsData>("/api/listings/", {
    onSuccess: (data) => {
      if (data?.results) {
        const apiListings: Listing[] = data.results.map((item) => ({
          id: String(item.product_id),
          title: item.name || "Untitled",
          price: item.price || 0,
          description: item.description || "",
          category: item.category || "3D Models",
          condition: item.status || "New",
          location: "Digital Download",
          seller: "Creator Studio",
          image: item.image || "https://images.unsplash.com/photo-1636189239307-9f3a701f30a8",
          postedDate: new Date().toISOString().split("T")[0],
        }));
        setListings(apiListings);
      }
    },
    onError: () => {
      // Failed to fetch listings
    },
  });

  const categories = [
    "All",
    "3D Models",
    "2D Assets",
    "Shaders",
    "Textures",
    "VFX",
    "Audio",
    "UI/UX",
  ];

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
            Game Assets Marketplace
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover premium shaders, models, textures, and more from talented creators
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search for game assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <button className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700">
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Categories */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  selectedCategory === category
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            {filteredListings.length} {filteredListings.length === 1 ? "asset" : "assets"} found
          </p>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-500 dark:text-gray-400">Loading assets...</p>
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-500 dark:text-gray-400">
              No assets found matching your search.
            </p>
          </div>
        )}
        {/* View All Link */}
        {filteredListings.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to={`/search${selectedCategory !== "All" ? `?category=${selectedCategory}` : ""}`}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-600 px-6 py-3 font-medium text-purple-600 transition-colors hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20"
            >
              View All Assets <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
