import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { ArrowLeft, UserPlus, UserCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ProductCard } from "../components/ProductCard";
import { api, mapListing } from "../lib/api";
import { Listing } from "../types";
import { toast } from "sonner";
import { UserAvatar } from "../components/UserAvatar";
import { useAsyncEffect } from "../hooks/useAsyncEffect";

interface SellerData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  listings?: Array<Record<string, unknown>>;
}

export function SellerProfile() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [products, setProducts] = useState<Listing[]>([]);
  const [isFollowPending, setIsFollowPending] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const isLoading = useAsyncEffect(
    async ({ isCancelled }) => {
      if (!sellerId) return;

      const sellerData = await api.getPublicUserProfile(sellerId);
      const listings = Array.isArray(sellerData?.listings) ? sellerData.listings : [];

      if (isCancelled()) return;

      setSeller({
        id: String(sellerData?.id ?? sellerId),
        name: sellerData?.name ?? "Unknown seller",
        email: sellerData?.email ?? "",
        phone: sellerData?.phone,
        avatar_url: sellerData?.avatar_url,
        listings,
      });
      setProducts(listings.map(mapListing));

      const sellerNumericId = Number(sellerId);
      if (!Number.isNaN(sellerNumericId)) {
        const counts = await api.getFollowerCount(sellerNumericId).catch(() => null);
        if (counts && !isCancelled()) {
          setFollowersCount(counts.followers ?? 0);
          setFollowingCount(counts.following ?? 0);
        }

        if (user?.id && user.id !== sellerId) {
          const following = await api.getFollowing(Number(user.id)).catch(() => null);
          const followedUsers = Array.isArray(following) ? following : (following?.results ?? []);
          if (!isCancelled()) {
            setIsFollowing(
              followedUsers.some((entry: { user_id?: number | string; id?: number | string }) => {
                const entryId = String(entry.user_id ?? entry.id ?? "");
                return entryId === String(sellerId);
              })
            );
          }
        }
      }
    },
    [sellerId, user?.id],
    {
      onError: (error) => {
        console.error("Failed to load seller profile:", error);
        toast.error("Failed to load seller profile");
      },
    }
  );

  if (isLoading) {
    return (
      <div className="app-page flex items-center justify-center">
        <p className="text-lg text-gray-500 dark:text-gray-400">Loading seller profile...</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Seller not found
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            The seller you're looking for doesn't exist.
          </p>
          <Link to="/" className="btn-primary inline-flex">
            <ArrowLeft className="h-4 w-4" /> Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === sellerId;

  const handleToggleFollow = async () => {
    if (!seller || !user || isOwnProfile) return;

    setIsFollowPending(true);
    try {
      const sellerNumericId = Number(seller.id);
      if (Number.isNaN(sellerNumericId)) return;

      if (isFollowing) {
        await api.unfollowUser(sellerNumericId);
        setIsFollowing(false);
        setFollowersCount((count) => Math.max(0, count - 1));
        toast.success(`Unfollowed ${seller.name}`);
      } else {
        await api.followUser(sellerNumericId);
        setIsFollowing(true);
        setFollowersCount((count) => count + 1);
        toast.success(`Following ${seller.name}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update follow state");
    } finally {
      setIsFollowPending(false);
    }
  };

  return (
    <div className="app-page">
      <div className="app-container">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Browse
        </Link>

        <div className="surface mb-8 overflow-hidden">
          <div className="flex flex-col gap-6 bg-gradient-to-r from-purple-600 to-purple-800 p-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-6">
              <UserAvatar
                userId={seller.id}
                src={seller.avatar_url}
                name={seller.name}
                sizeClassName="h-24 w-24 text-2xl"
              />
              <div className="min-w-0">
                <h1 className="text-3xl font-bold break-words text-white">{seller.name}</h1>
                {seller.email && <p className="break-words text-purple-200">{seller.email}</p>}
              </div>
            </div>

            {!isOwnProfile && user && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => void handleToggleFollow()}
                  disabled={isFollowPending}
                  className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors ${
                    isFollowing
                      ? "border border-white/20 bg-white/10 text-white hover:bg-white/15"
                      : "border border-white bg-white text-purple-700 hover:bg-purple-50"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {isFollowPending ? "Updating..." : isFollowing ? "Following" : "Follow"}
                </button>
                <button
                  onClick={() => {
                    // Navigate to messages; user can start a conversation with the seller from the inbox
                    navigate("/chat");
                    toast.success("Open Messages to start a conversation with this seller");
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-white bg-white text-purple-700 px-4 py-2 hover:bg-purple-50"
                >
                  Chat
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-200 p-6 sm:grid-cols-3 dark:border-gray-800">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Products</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{followersCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
            </div>
            <div className="col-span-2 text-center sm:col-span-1">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{followingCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Following</p>
            </div>
            {seller.phone && (
              <div className="col-span-2 text-center sm:col-span-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {seller.phone}
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            {isOwnProfile ? "Your Products" : `${seller.name}'s Products`}
          </h2>

          {products.length === 0 ? (
            <div className="empty-state">
              <p className="text-gray-600 dark:text-gray-400">
                No products yet.{" "}
                {isOwnProfile && (
                  <Link
                    to="/sell"
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
                  >
                    Start selling
                  </Link>
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} listing={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
