import { useState } from "react";
import { Link } from "react-router";
import { Camera, Edit3, Mail, Phone, Plus, Save, Shield, Upload, User } from "lucide-react";
import { useAuth } from "@/app/core/contexts/AuthContext";
import { ProductCard } from "@/app/features/products/components/ProductCard";
import { api, mapListing } from "@/app/core/lib/api";
import { Listing } from "@/app/core/types";
import { toast } from "sonner";
import { UserAvatar } from "@/app/shared/components/UserAvatar";
import { useImageUpload } from "@/app/features/listings/hooks/useImageUpload";
import { useAsyncEffect } from "@/app/core/hooks/useAsyncEffect";

export function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [products, setProducts] = useState<Listing[]>([]);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const avatarUpload = useImageUpload({
    onSuccess: async (result) => {
      await updateUser({ avatar_url: result.url });
    },
    successMessage: "Profile photo updated",
    errorContext: "profile photo",
  });

  const isLoadingProducts = useAsyncEffect(
    async ({ isCancelled }) => {
      if (!user?.id) return;

      const profile = await api.getProfile();
      const listings = Array.isArray(profile?.listings) ? profile.listings : [];

      if (isCancelled()) return;

      setProducts(listings.map(mapListing));
    },
    [user?.id]
  );

  const handleSave = async () => {
    try {
      await updateUser(formData);
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const toggleEditing = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setEditing((current) => !current);
  };

  const handleAvatarUpload = () => {
    avatarUpload.handleUpload();
  };

  const initials = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="app-page">
      <div className="app-container-form">
        <h1 className="page-title mb-8">My Profile</h1>

        <div className="surface overflow-hidden">
          <div className="flex flex-col gap-6 bg-gradient-to-r from-purple-600 to-purple-800 p-8 sm:flex-row sm:items-center">
            <UserAvatar
              userId={user?.id}
              src={user?.avatar_url}
              name={user?.name || user?.email || initials}
              sizeClassName="h-20 w-20 text-xl"
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <p className="break-words text-purple-200">{user?.email}</p>
              {user?.role && (
                <span className="mt-2 inline-flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-xs text-white backdrop-blur-sm">
                  <Shield className="h-3 w-3" />
                  {user.role}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Account Details
              </h3>
              <button
                onClick={toggleEditing}
                className="btn-ghost text-purple-600 dark:text-purple-400"
              >
                <Edit3 className="h-4 w-4" />
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>

            <div>
              <label className="form-label">
                <Camera className="h-4 w-4" /> Profile Photo
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => avatarUpload.setSelectedFile(e.target.files?.[0] ?? null)}
                  className="form-control"
                />
                <button
                  type="button"
                  onClick={handleAvatarUpload}
                  disabled={!avatarUpload.selectedFile || avatarUpload.isUploading}
                  className="btn-secondary h-10 shrink-0"
                >
                  <Upload className="h-4 w-4" />
                  <span>{avatarUpload.isUploading ? "Uploading..." : "Upload photo"}</span>
                </button>
              </div>
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
                disabled
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
              <button onClick={handleSave} className="btn-primary px-6 py-3">
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Products</h2>
            <Link to="/sell" className="btn-primary">
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
              <Link to="/sell" className="btn-primary px-6 py-3">
                <Plus className="h-4 w-4" />
                Create Your First Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  listing={product}
                  footerAction={
                    <Link
                      to={`/listing/${product.id}/edit`}
                      className="text-sm font-medium text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      Edit
                    </Link>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
