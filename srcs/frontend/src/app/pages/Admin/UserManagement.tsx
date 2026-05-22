import { useState, useEffect } from "react";
import { Users, Search, MoreHorizontal, CheckCircle, Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/api";
import { User } from "../../types";

type UserAction = "ban" | "unban" | "delete";

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.getAdminUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err);
        toast.error(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filtered = users
    .filter((u) => filter === "all" || u.status === filter)
    .filter((u) =>
      [u.name, u.email, u.role, u.status]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(search.toLowerCase()))
    );

  const updateUserInState = (updatedUser: User) => {
    setUsers((current) =>
      current.map((user) => (user.id === updatedUser.id ? { ...user, ...updatedUser } : user))
    );
  };

  const handleAction = async (user: User, action: UserAction) => {
    if (action === "delete") {
      const confirmed = window.confirm(
        `Deactivate ${user.email}? This will prevent the user from logging in.`
      );
      if (!confirmed) return;
    }

    const actionKey = `${user.id}:${action}`;
    setPendingAction(actionKey);
    setOpenMenu(null);

    try {
      if (action === "ban") {
        const updatedUser = await api.banUser(user.id);
        updateUserInState(updatedUser);
        toast.success("User banned successfully");
      } else if (action === "unban") {
        const updatedUser = await api.unbanUser(user.id);
        updateUserInState(updatedUser);
        toast.success("User activated successfully");
      } else {
        await api.deleteUser(user.id);
        updateUserInState({ ...user, status: "deactivated" });
        toast.success("User deactivated successfully");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setPendingAction(null);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
  };

  const getStatusClassName = (status?: User["status"]) => {
    if (status === "active") {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
    if (status === "banned") {
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    }
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
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
              {["all", "active", "banned", "deactivated"].map((f) => (
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
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">No users found.</div>
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
                          {user.role || "user"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClassName(
                            user.status
                          )}`}
                        >
                          {user.status || "active"}
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
                              {user.status === "banned" && (
                                <button
                                  onClick={() => handleAction(user, "unban")}
                                  disabled={pendingAction === `${user.id}:unban`}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                >
                                  <CheckCircle className="h-4 w-4" /> Activate
                                </button>
                              )}
                              {user.status !== "banned" && user.status !== "deactivated" && (
                                <button
                                  onClick={() => handleAction(user, "ban")}
                                  disabled={pendingAction === `${user.id}:ban`}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                                >
                                  <Ban className="h-4 w-4" /> Ban
                                </button>
                              )}
                              {user.status !== "deactivated" && (
                                <button
                                  onClick={() => handleAction(user, "delete")}
                                  disabled={pendingAction === `${user.id}:delete`}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              )}
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
