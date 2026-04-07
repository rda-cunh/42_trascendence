import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { ProductCard } from "../components/ProductCard";
import { Listing, mockListings } from "../data/mockListings";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 8;

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

  useEffect(() => {
    fetch("/api/listings/")
      .then((res) => res.json())
      .then((data) => {
        if (data?.results) {
          const apiListings: Listing[] = data.results.map((item: Record<string, unknown>) => ({
            id: String(item.product_id),
            title: item.name || "Untitled",
            price: item.price || 0,
            description: item.description || "",
            category: item.category || "3D Models",
            condition: item.status || "New",
            location: "Digital Download",
            seller: "Creator Studio",
            image: item.image || mockListings[0].image,
            postedDate: new Date().toISOString().split("T")[0],
          }));
          setListings(apiListings);
        } else {
          setListings(mockListings);
        }
      })
      .catch(() => setListings(mockListings))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = listings
    .filter((l) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q || l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
      const matchesCat = category === "All" || l.category === category;
      const matchesMin = !minPrice || l.price >= parseFloat(minPrice);
      const matchesMax = !maxPrice || l.price <= parseFloat(maxPrice);
      return matchesQuery && matchesCat && matchesMin && matchesMax;
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

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Search Assets</h1>

        {/* Filters */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search assets..."
                className="w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-10 text-gray-900 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  category === c
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                Min Price
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
                placeholder="$0"
                min="0"
                className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                Max Price
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                placeholder="∞"
                min="0"
                className="w-24 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <p className="mb-4 text-gray-600 dark:text-gray-400">{filtered.length} assets found</p>

        {isLoading ? (
          <p className="py-12 text-center text-gray-500 dark:text-gray-400">Loading...</p>
        ) : paginated.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginated.map((l) => (
                <ProductCard key={l.id} listing={l} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 p-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-gray-300 p-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <SlidersHorizontal className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
            <p className="text-lg text-gray-500 dark:text-gray-400">
              No assets match your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
