import { useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { api, mapListing } from "../lib/api";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Listing } from "../types";
import { PRODUCT_CATEGORIES } from "../utils/constants";
import { useAsyncEffect } from "../hooks/useAsyncEffect";

export function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 12;

  const categories = PRODUCT_CATEGORIES;

  const isLoading = useAsyncEffect(async ({ isCancelled }) => {
    const data = await api.getListings();

    // Handle both direct array response and paginated response
    const results = Array.isArray(data) ? data : data?.results || [];

    if (isCancelled()) return;

    if (results.length > 0) {
      const apiListings: Listing[] = results.map(mapListing);
      setListings(apiListings);
    }
  }, []);

  const filtered = listings
    .filter((listing) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        listing.title.toLowerCase().includes(q) ||
        listing.description.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === "All" || listing.category === selectedCategory;
      const matchesMinPrice = !minPrice || listing.price >= parseFloat(minPrice);
      const matchesMaxPrice = !maxPrice || listing.price <= parseFloat(maxPrice);
      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "oldest":
          return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
        default:
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      }
    });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Check if this is initial empty state (no listings at all) vs filtered search
  const isInitiallyEmpty = isLoading === false && listings.length === 0;
  const isFilteredEmpty = !isInitiallyEmpty && filtered.length === 0;

  return (
    <div className="app-page">
      <div className="app-container">
        {/* Hero Section */}
        <div className="page-header">
          <h1 className="mb-2 text-4xl font-bold tracking-normal text-gray-900 dark:text-white">
            Game Assets Marketplace
          </h1>
          <p className="muted-text text-lg">
            Discover premium shaders, models, textures, and more from talented creators
          </p>
        </div>

        {/* Search and Filters */}
        <div className="surface-padded mb-8">
          {/* Search and Sort */}
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search for game assets..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="form-control-icon"
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="btn-primary px-6 py-3">
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
              {/* Sort */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-control"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {/* Categories */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setPage(1);
                      }}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
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

              {/* Price Filter */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price Range
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Min"
                      min="0"
                      className="form-control"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Max"
                      min="0"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              {/* Close filters button */}
              <button
                onClick={() => setShowFilters(false)}
                className="btn-ghost px-0 hover:bg-transparent dark:hover:bg-transparent"
              >
                <X className="h-4 w-4" />
                Close Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!isInitiallyEmpty && (
          <div className="mb-4">
            <p className="muted-text">
              {filtered.length} {filtered.length === 1 ? "asset" : "assets"} found
            </p>
          </div>
        )}

        {/* Listings Grid */}
        {isLoading ? (
          <div className="empty-state">
            <p className="text-lg text-gray-500 dark:text-gray-400">Loading assets...</p>
          </div>
        ) : isInitiallyEmpty ? (
          <div className="empty-state">
            <SlidersHorizontal className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
            <p className="text-lg text-gray-500 dark:text-gray-400">
              No assets available in the marketplace yet.
            </p>
          </div>
        ) : isFilteredEmpty ? (
          <div className="empty-state">
            <SlidersHorizontal className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
            <p className="text-lg text-gray-500 dark:text-gray-400">
              No assets found matching your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginated.map((listing) => (
                <ProductCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-icon border border-gray-300 dark:border-gray-700"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                      page === i + 1
                        ? "bg-purple-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-icon border border-gray-300 dark:border-gray-700"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
