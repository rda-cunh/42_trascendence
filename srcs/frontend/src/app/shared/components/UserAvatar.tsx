import { ImageWithFallback } from "./figma/ImageWithFallback";
import { resolveImageUrl } from "@/app/core/lib/images";
import { usePresence } from "@/app/core/contexts/PresenceContext";

interface UserAvatarProps {
  userId?: string | number | null;
  name?: string;
  src?: string | null;
  sizeClassName: string;
  className?: string;
}

export function UserAvatar({ userId, name, src, sizeClassName, className }: UserAvatarProps) {
  const initials = name?.trim().charAt(0).toUpperCase() || "U";
  const isOnline = usePresence(userId);

  return (
    <div className={`relative inline-block ${className ?? ""}`}>
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white shadow-lg ring-1 ring-black/10 ${sizeClassName}`}
      >
        {src ? (
          <ImageWithFallback
            src={resolveImageUrl(src)}
            alt={name || "User avatar"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[0.55em] font-semibold tracking-[0.2em] text-white/90 uppercase">
            {initials}
          </span>
        )}
      </div>
      {userId != null && (
        <span
          className={`absolute right-0 bottom-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-900 ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
          title={isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}
