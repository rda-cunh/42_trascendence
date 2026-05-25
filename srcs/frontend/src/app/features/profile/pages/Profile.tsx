import { useState } from "react";
import { Link } from "react-router";
import {
  Camera,
  Edit3,
  Lock,
  Mail,
  Phone,
  Plus,
  Save,
  Shield,
  ShoppingBag,
  Upload,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "@/app/core/contexts/AuthContext";
import { ProductCard } from "@/app/features/products/components/ProductCard";
import { api, mapListing } from "@/app/core/lib/api";
import { Listing } from "@/app/core/types";
import { toast } from "sonner";
import { UserAvatar } from "@/app/shared/components/UserAvatar";
import { useImageUpload } from "@/app/features/listings/hooks/useImageUpload";
import { useAsyncEffect } from "@/app/core/hooks/useAsyncEffect";
import { ROUTES } from "@/app/shared/utils/constants";
import { validatePassword } from "@/app/shared/utils/validators";
import { UploadProgressBar } from "@/app/shared/components/UploadProgressBar";

export function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
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

  const handleChangePassword = async () => {
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }

    const validation = validatePassword(passwordForm.next);
    if (!validation.isValid) {
      toast.error(validation.errors[0] ?? "Invalid password");
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.changePassword(passwordForm.current, passwordForm.next);
      setPasswordForm({ current: "", next: "", confirm: "" });
      setShowPasswordForm(false);
      toast.success("Password updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const initials = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="app-page">
      <div className="app-container-form">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="page-title">My Profile</h1>
          <div className="flex flex-wrap gap-2">
            <Link to={ROUTES.ORDERS} className="btn-secondary">
              <ShoppingBag className="h-4 w-4" />
              My Orders
            </Link>
            <Link to={ROUTES.FRIENDS} className="btn-secondary">
              <Users className="h-4 w-4" />
              Following
            </Link>
          </div>
        </div>

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
              <UploadProgressBar
                progress={avatarUpload.progress}
                isUploading={avatarUpload.isUploading}
              />
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

            <div className="border-t border-gray-200 pt-5 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setShowPasswordForm((v) => !v)}
                className="btn-ghost text-purple-600 dark:text-purple-400"
              >
                <Lock className="h-4 w-4" />
                {showPasswordForm ? "Hide password form" : "Change password"}
              </button>

              {showPasswordForm && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="form-label">Current password</label>
                    <input
                      type="password"
                      value={passwordForm.current}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, current: e.target.value }))
                      }
                      className="form-control"
                      autoComplete="current-password"
                    />
                  </div>
                  <div>
                    <label className="form-label">New password</label>
                    <input
                      type="password"
                      value={passwordForm.next}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
                      className="form-control"
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <label className="form-label">Confirm new password</label>
                    <input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, confirm: e.target.value }))
                      }
                      className="form-control"
                      autoComplete="new-password"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleChangePassword()}
                    disabled={isChangingPassword}
                    className="btn-primary px-6 py-3"
                  >
                    {isChangingPassword ? "Updating..." : "Update password"}
                  </button>
                </div>
              )}
            </div>
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
