import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { api, isDeletedListing, mapListing } from "@/app/core/lib/api";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Listing } from "@/app/core/types";
import { PRODUCT_CATEGORIES, STORAGE_KEYS } from "@/app/shared/utils/constants";

const API_PAGE_SIZE = 10;
const DISPLAY_PAGE_SIZE = 12;

function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const recent = loadRecentSearches().filter((s) => s !== trimmed);
  recent.unshift(trimmed);
  localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(recent.slice(0, 8)));
}

export function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [listings, setListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecentSearches);

  const categories = PRODUCT_CATEGORIES;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await api.getPublicListings({
          search: debouncedSearch || undefined,
          page,
          limit: API_PAGE_SIZE,
        });
        const results = Array.isArray(data) ? data : [];

        if (cancelled) return;

        const apiListings: Listing[] = results
          .filter((item: unknown) => !isDeletedListing(item))
          .map(mapListing);
        setListings(apiListings.filter((listing) => listing.status === "Active"));
        setHasMore(apiListings.length >= API_PAGE_SIZE);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load listings:", err);
          setListings([]);
          setHasMore(false);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, page]);

  const filtered = useMemo(() => {
    return listings
      .filter((listing) => {
        const matchesCategory =
          selectedCategory === "All" || listing.category === selectedCategory;
        const matchesMinPrice = !minPrice || listing.price >= parseFloat(minPrice);
        const matchesMaxPrice = !maxPrice || listing.price <= parseFloat(maxPrice);
        return matchesCategory && matchesMinPrice && matchesMaxPrice;
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
  }, [listings, selectedCategory, minPrice, maxPrice, sortBy]);

  const displayPages = Math.max(1, Math.ceil(filtered.length / DISPLAY_PAGE_SIZE));
  const displayPage = Math.min(page, displayPages);
  const paginated = filtered.slice(
    (displayPage - 1) * DISPLAY_PAGE_SIZE,
    displayPage * DISPLAY_PAGE_SIZE
  );

  const isInitiallyEmpty = !isLoading && !debouncedSearch && listings.length === 0;
  const isFilteredEmpty = !isInitiallyEmpty && filtered.length === 0;

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      setRecentSearches(loadRecentSearches());
    }
    setPage(1);
  };

  return (
    <div className="app-page">
      <div className="app-container">
        <div className="page-header">
          <h1 className="mb-2 text-4xl font-bold tracking-normal text-gray-900 dark:text-white">
            Game Assets Marketplace
          </h1>
          <p className="muted-text text-lg">
            Discover premium shaders, models, textures, and more from talented creators
          </p>
        </div>

        <div className="surface-padded mb-8">
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit();
                }}
                onBlur={handleSearchSubmit}
                className="form-control-icon"
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="btn-primary px-6 py-3">
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {recentSearches.length > 0 && !searchQuery && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Recent:</span>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchQuery(term);
                    setPage(1);
                  }}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          {showFilters && (
            <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
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

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
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

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price Range
                </label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Min"
                    min="0"
                    className="form-control flex-1"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Max"
                    min="0"
                    className="form-control flex-1"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="btn-ghost px-0 hover:bg-transparent dark:hover:bg-transparent"
              >
                <X className="h-4 w-4" />
                Close Filters
              </button>
            </div>
          )}
        </div>

        {!isInitiallyEmpty && (
          <div className="mb-4">
            <p className="muted-text">
              {filtered.length} {filtered.length === 1 ? "asset" : "assets"} on this page
              {debouncedSearch ? ` for "${debouncedSearch}"` : ""}
            </p>
          </div>
        )}

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

            {(page > 1 || hasMore) && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="btn-icon border border-gray-300 dark:border-gray-700"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="px-3 text-sm text-gray-600 dark:text-gray-400">Page {page}</span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore || isLoading}
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
