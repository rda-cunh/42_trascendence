import { useState } from "react";
import { Users, Search, MoreHorizontal, Ban, CheckCircle, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  listings: number;
}

const mockUsers: MockUser[] = [
  { id: "1", name: "GameArtStudio", email: "art@studio.com", role: "seller", status: "active", joined: "2026-01-15", listings: 24 },
  { id: "2", name: "PixelCraftPro", email: "pixel@craft.com", role: "seller", status: "active", joined: "2026-01-20", listings: 18 },
  { id: "3", name: "TextureMaster", email: "tex@master.com", role: "seller", status: "active", joined: "2026-02-01", listings: 12 },
  { id: "4", name: "JohnDoe", email: "john@example.com", role: "buyer", status: "active", joined: "2026-02-10", listings: 0 },
  { id: "5", name: "ShaderWizard", email: "shader@wiz.com", role: "seller", status: "suspended", joined: "2026-02-15", listings: 8 },
  { id: "6", name: "AdminUser", email: "admin@hub.com", role: "admin", status: "active", joined: "2026-01-01", listings: 0 },
];

export function UserManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = (userId: string, action: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        switch (action) {
          case "suspend": return { ...u, status: "suspended" };
          case "activate": return { ...u, status: "active" };
          case "delete": return u; // would delete in real app
          default: return u;
        }
      })
    );
    toast.success(`User ${action}d successfully`);
    setOpenMenu(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-8 h-8 text-purple-600" /> User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{users.length} total users</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Listings</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Joined</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                          : user.role === "seller"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}>
                        {user.role === "admin" && <Shield className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === "active"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      }`}>{user.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{user.listings}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.joined}</td>
                    <td className="px-6 py-4 text-right relative">
                      <button onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {openMenu === user.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                          <div className="absolute right-6 mt-1 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl z-50 py-1">
                            {user.status === "active" ? (
                              <button onClick={() => handleAction(user.id, "suspend")}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                <Ban className="w-4 h-4" /> Suspend
                              </button>
                            ) : (
                              <button onClick={() => handleAction(user.id, "activate")}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Activate
                              </button>
                            )}
                            <button onClick={() => handleAction(user.id, "delete")}
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
