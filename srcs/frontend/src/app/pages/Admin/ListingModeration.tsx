import { useState } from "react";
import { Package, Search, MoreHorizontal, CheckCircle, XCircle, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";
import { mockAdminListings, Listing } from "../../data/mockData";

interface MockListing extends Listing {
  status?: string;
  created?: string;
}

export function ListingModeration() {
  const [listings, setListings] = useState<MockListing[]>(
    mockAdminListings.map((l) => ({
      ...l,
      status: "approved",
      created: l.postedDate,
    }))
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = listings
    .filter((l) => filter === "all" || l.status === filter)
    .filter(
      (l) =>
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.seller.toLowerCase().includes(search.toLowerCase())
    );

  const handleAction = (id: string, action: string) => {
    setListings((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        switch (action) {
          case "approve":
            return { ...l, status: "approved" };
          case "reject":
            return { ...l, status: "rejected" };
          case "delete":
            return l;
          default:
            return l;
        }
      })
    );
    toast.success(`Listing ${action}d successfully`);
    setOpenMenu(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white">
            <Package className="h-8 w-8 text-purple-600" /> Listing Moderation
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Review and manage marketplace listings
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-4 sm:flex-row dark:border-gray-800">
            <div className="relative max-w-sm">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search listings..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-9 text-sm text-gray-900 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              {["all", "pending", "approved", "rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-sm capitalize transition-colors ${
                    filter === f
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Listing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Seller
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filtered.map((listing) => (
                  <tr
                    key={listing.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {listing.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {listing.created}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {listing.seller}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {listing.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      ${listing.price}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          listing.status === "approved"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : listing.status === "pending"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {listing.status}
                      </span>
                    </td>
                    <td className="relative px-6 py-4 text-right">
                      <button
                        onClick={() => setOpenMenu(openMenu === listing.id ? null : listing.id)}
                        className="rounded p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                      {openMenu === listing.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                          <div className="absolute right-6 z-50 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                            <Link
                              to={`/product/${listing.id}`}
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              <Eye className="h-4 w-4" /> View
                            </Link>
                            {listing.status !== "approved" && (
                              <button
                                onClick={() => handleAction(listing.id, "approve")}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                              >
                                <CheckCircle className="h-4 w-4" /> Approve
                              </button>
                            )}
                            {listing.status !== "rejected" && (
                              <button
                                onClick={() => handleAction(listing.id, "reject")}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                <XCircle className="h-4 w-4" /> Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleAction(listing.id, "delete")}
                              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
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
