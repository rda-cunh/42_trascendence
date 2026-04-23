import { useState, useEffect } from "react";
import { Users, Search, MoreHorizontal, CheckCircle, Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { User } from "../../types";

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      // TODO: Add API endpoint for getting all users
      // For now, show empty state
      setIsLoading(false);
    };

    fetchUsers();
  }, []);

  const filtered = users
    .filter((u) => filter === "all" || u.status === filter)
    .filter(
      (u) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );

  const handleAction = (id: string, action: string) => {
    toast.success(`User ${action}d successfully`);
    setOpenMenu(null);
    // TODO: Call API to update user
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white">
            <Users className="h-8 w-8 text-purple-600" /> User Management
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Manage and monitor user accounts</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col justify-between gap-4 border-b border-gray-200 p-4 sm:flex-row dark:border-gray-800">
            <div className="relative max-w-sm">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-9 text-sm text-gray-900 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              {["all", "active", "suspended"].map((f) => (
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

          {users.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              No users found. API endpoint not yet configured.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Joined
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
                  {filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {user.joinDate}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            user.status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="relative px-6 py-4 text-right">
                        <button
                          onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                          className="rounded p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                        {openMenu === user.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-6 z-50 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                              {user.status !== "active" && (
                                <button
                                  onClick={() => handleAction(user.id, "activate")}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                >
                                  <CheckCircle className="h-4 w-4" /> Activate
                                </button>
                              )}
                              {user.status !== "suspended" && (
                                <button
                                  onClick={() => handleAction(user.id, "suspend")}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                                >
                                  <Ban className="h-4 w-4" /> Suspend
                                </button>
                              )}
                              <button
                                onClick={() => handleAction(user.id, "delete")}
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
          )}
        </div>
      </div>
    </div>
  );
}
