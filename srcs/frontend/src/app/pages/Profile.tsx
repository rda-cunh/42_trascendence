import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { User, Mail, Phone, Save, Edit3, Shield, Plus } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { api } from "../lib/api";
import { toast } from "sonner";

interface UserProduct {
  name: string;
  description?: string;
  price: number;
  images?: Array<{ image_hash: string; display_order: number }>;
}

export function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Fetch user's products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user?.id) return;

      try {
        const profile = await api.getProfile();
        if (profile?.listings && Array.isArray(profile.listings)) {
          setProducts(profile.listings);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [user?.id]);

  const handleSave = async () => {
    try {
      await updateUser(formData);
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  return (
    <div className="app-page">
      <div className="app-container-form">
        <h1 className="page-title mb-8">My Profile</h1>

        <div className="surface overflow-hidden">
          {/* Avatar section */}
          <div className="flex items-center gap-6 bg-gradient-to-r from-purple-600 to-purple-800 p-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-bold text-white backdrop-blur-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <p className="text-purple-200">{user?.email}</p>
              {user?.role && (
                <span className="mt-2 inline-flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-xs text-white backdrop-blur-sm">
                  <Shield className="h-3 w-3" />
                  {user.role}
                </span>
              )}
            </div>
          </div>

          {/* Profile form */}
          <div className="space-y-5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Account Details
              </h3>
              <button
                onClick={() => setEditing(!editing)}
                className="btn-ghost text-purple-600 dark:text-purple-400"
              >
                <Edit3 className="h-4 w-4" />
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>

            <div>
              <label className="form-label">
                <User className="h-4 w-4" /> Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editing}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">
                <Mail className="h-4 w-4" /> Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!editing}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">
                <Phone className="h-4 w-4" /> Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editing}
                placeholder="Not set"
                className="form-control"
              />
            </div>

            {editing && (
              <button
                onClick={handleSave}
                className="btn-primary px-6 py-3"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Your Products Section */}
        <div className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Products</h2>
            <Link
              to="/sell"
              className="btn-primary"
            >
              <Plus className="h-4 w-4" />
              New Product
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="empty-state">
              <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                You haven't posted any products yet.
              </p>
              <Link
                to="/sell"
                className="btn-primary px-6 py-3"
              >
                <Plus className="h-4 w-4" />
                Create Your First Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, idx) => (
                <div
                  key={idx}
                  className="surface-interactive overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {product.images && product.images.length > 0 ? (
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1636189239307-9f3a701f30a8"
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <span>No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </h3>
                    <p className="mb-3 line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
                      {product.description || "No description"}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        ${product.price.toFixed(2)}
                      </p>
                      <Link
                        to={`/listing/${idx}/edit`}
                        className="text-sm text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
