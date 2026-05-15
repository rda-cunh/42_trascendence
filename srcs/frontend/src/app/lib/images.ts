export const FALLBACK_LISTING_IMAGE =
  "https://images.unsplash.com/photo-1636189239307-9f3a701f30a8";

export function resolveImageUrl(value?: string | null, fallback = FALLBACK_LISTING_IMAGE) {
  const image = value?.trim();

  if (!image) return fallback;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith("/images/")) return image;

  return `/images/${image}`;
}
