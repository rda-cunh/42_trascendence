import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/core/contexts/AuthContext";
import { api } from "@/app/core/lib/api";
import { UserAvatar } from "@/app/shared/components/UserAvatar";

interface FollowingUser {
  user_id: number;
  name: string;
  avatar_url?: string;
}

export function Friends() {
  const { user } = useAuth();
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [onlineMap, setOnlineMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    const load = async () => {
      try {
        const data = await api.getFollowing(Number(user.id), 100, 0);
        const rows = Array.isArray(data) ? data : (data?.results ?? []);
        const mapped: FollowingUser[] = rows
          .map((entry: Record<string, unknown>) => ({
            user_id: Number(entry.user_id ?? entry.id ?? 0),
            name: String(entry.name ?? entry.user_name ?? "User"),
            avatar_url:
              typeof entry.avatar_url === "string"
                ? entry.avatar_url
                : typeof entry.avatar === "string"
                  ? entry.avatar
                  : undefined,
          }))
          .filter((entry: FollowingUser) => entry.user_id > 0);

        if (cancelled) return;
        setFollowing(mapped);

        if (mapped.length > 0) {
          const presence = await api.getPresence(mapped.map((f) => f.user_id));
          if (!cancelled) {
            const next: Record<string, boolean> = {};
            for (const [id, online] of Object.entries(presence)) {
              next[id] = Boolean(online);
            }
            setOnlineMap(next);
          }
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Failed to load following");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (following.length === 0) return;

    const refreshPresence = () => {
      void api
        .getPresence(following.map((f) => f.user_id))
        .then((presence) => {
          const next: Record<string, boolean> = {};
          for (const [id, online] of Object.entries(presence)) {
            next[id] = Boolean(online);
          }
          setOnlineMap(next);
        })
        .catch(() => undefined);
    };

    const interval = window.setInterval(refreshPresence, 30000);
    return () => window.clearInterval(interval);
  }, [following]);

  return (
    <div className="app-page">
      <div className="app-container-form">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <Users className="h-8 w-8 text-purple-600" />
            People You Follow
          </h1>
        </div>

        {isLoading ? (
          <div className="empty-state">
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        ) : following.length === 0 ? (
          <div className="empty-state surface-padded">
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              You are not following anyone yet. Visit a seller profile and tap Follow.
            </p>
            <Link to="/" className="btn-primary inline-flex">
              Browse marketplace
            </Link>
          </div>
        ) : (
          <ul className="surface divide-y divide-gray-200 dark:divide-gray-800">
            {following.map((person) => (
              <li key={person.user_id}>
                <Link
                  to={`/seller/${person.user_id}`}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <UserAvatar
                    userId={String(person.user_id)}
                    name={person.name}
                    src={person.avatar_url}
                    sizeClassName="h-12 w-12"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{person.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {onlineMap[String(person.user_id)] ? (
                        <span className="text-green-600 dark:text-green-400">Online</span>
                      ) : (
                        <span>Offline</span>
                      )}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
