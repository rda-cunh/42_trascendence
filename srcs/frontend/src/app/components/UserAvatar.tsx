import { ImageWithFallback } from "./figma/ImageWithFallback";
import { resolveImageUrl } from "../lib/images";

interface UserAvatarProps {
  name?: string;
  src?: string | null;
  sizeClassName: string;
  className?: string;
}

export function UserAvatar({ name, src, sizeClassName, className }: UserAvatarProps) {
  const initials = name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white shadow-lg ring-1 ring-black/10 ${sizeClassName} ${className ?? ""}`}
    >
      {src ? (
        <ImageWithFallback
          src={resolveImageUrl(src)}
          alt={name || "User avatar"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-[0.55em] font-semibold uppercase tracking-[0.2em] text-white/90">
          {initials}
        </span>
      )}
    </div>
  );
}