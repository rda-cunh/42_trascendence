import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { ProductCard } from "../components/ProductCard";
import { Listing, mockListings } from "../data/mockListings";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const categories = ["All", "3D Models", "2D Assets", "Shaders", "Textures", "VFX", "Audio", "UI/UX"];

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/listings/")
      .then((res) => res.json())
      .then((data) => {
        if (data?.results) {
          const apiListings: Listing[] = data.results.map((item: any) => ({
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
      const matchesQuery = !q || l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
      const matchesCat = category === "All" || l.category === category;
      const matchesMin = !minPrice || l.price >= parseFloat(minPrice);
      const matchesMax = !maxPrice || l.price <= parseFloat(maxPrice);
      return matchesQuery && matchesCat && matchesMin && matchesMax;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "oldest": return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
        default: return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      }
    });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Search Assets</h1>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search assets..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((c) => (
              <button key={c} onClick={() => { setCategory(c); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  category === c
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}>{c}</button>
            ))}
          </div>

          <div className="flex gap-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Min Price</label>
              <input type="number" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                placeholder="$0" min="0"
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Max Price</label>
              <input type="number" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                placeholder="∞" min="0"
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Results */}
        <p className="text-gray-600 dark:text-gray-400 mb-4">{filtered.length} assets found</p>

        {isLoading ? (
          <p className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</p>
        ) : paginated.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginated.map((l) => <ProductCard key={l.id} listing={l} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === i + 1
                        ? "bg-purple-600 text-white"
                        : "border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}>{i + 1}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <SlidersHorizontal className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No assets match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
