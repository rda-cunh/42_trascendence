import { useState } from "react";
import { Package, Search, MoreHorizontal, CheckCircle, XCircle, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";

interface MockListing {
  id: string;
  title: string;
  seller: string;
  category: string;
  price: number;
  status: string;
  created: string;
  image: string;
}

const mockListings: MockListing[] = [
  { id: "1", title: "Stylized Character Model Pack", seller: "GameArtStudio", category: "3D Models", price: 45, status: "approved", created: "2026-03-15", image: "" },
  { id: "2", title: "Retro Pixel Art Sprite Sheet", seller: "PixelCraftPro", category: "2D Assets", price: 15, status: "approved", created: "2026-03-14", image: "" },
  { id: "3", title: "PBR Texture Pack - Sci-Fi", seller: "TextureMaster", category: "Textures", price: 35, status: "pending", created: "2026-03-20", image: "" },
  { id: "4", title: "Holographic Shader Collection", seller: "ShaderWizard", category: "Shaders", price: 28, status: "approved", created: "2026-03-10", image: "" },
  { id: "5", title: "Low Poly Environment Pack", seller: "PolyWorld", category: "3D Models", price: 65, status: "rejected", created: "2026-03-18", image: "" },
  { id: "6", title: "Suspicious Asset Upload", seller: "SpamUser", category: "Other", price: 5, status: "pending", created: "2026-03-29", image: "" },
];

export function ListingModeration() {
  const [listings, setListings] = useState(mockListings);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = listings
    .filter((l) => (filter === "all" || l.status === filter))
    .filter((l) => l.title.toLowerCase().includes(search.toLowerCase()) || l.seller.toLowerCase().includes(search.toLowerCase()));

  const handleAction = (id: string, action: string) => {
    setListings((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        switch (action) {
          case "approve": return { ...l, status: "approved" };
          case "reject": return { ...l, status: "rejected" };
          case "delete": return l;
          default: return l;
        }
      })
    );
    toast.success(`Listing ${action}d successfully`);
    setOpenMenu(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-8 h-8 text-purple-600" /> Listing Moderation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review and manage marketplace listings</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search listings..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {["all", "pending", "approved", "rejected"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                    filter === f
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}>{f}</button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Listing</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Seller</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filtered.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{listing.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{listing.created}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{listing.seller}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs">
                        {listing.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${listing.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        listing.status === "approved"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : listing.status === "pending"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>{listing.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button onClick={() => setOpenMenu(openMenu === listing.id ? null : listing.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {openMenu === listing.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                          <div className="absolute right-6 mt-1 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl z-50 py-1">
                            <Link to={`/product/${listing.id}`}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                              <Eye className="w-4 h-4" /> View
                            </Link>
                            {listing.status !== "approved" && (
                              <button onClick={() => handleAction(listing.id, "approve")}
                                className="w-full text-left px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Approve
                              </button>
                            )}
                            {listing.status !== "rejected" && (
                              <button onClick={() => handleAction(listing.id, "reject")}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                <XCircle className="w-4 h-4" /> Reject
                              </button>
                            )}
                            <button onClick={() => handleAction(listing.id, "delete")}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
