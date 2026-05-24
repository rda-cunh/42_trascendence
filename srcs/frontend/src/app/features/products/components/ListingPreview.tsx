import { useMemo, useState } from "react";
import { Image, Sparkles } from "lucide-react";
import { ImageWithFallback } from "@/app/shared/components/figma/ImageWithFallback";
import { ShaderPreview } from "./ShaderPreview";
import { Listing } from "@/app/core/types";
import { resolveImageUrl } from "@/app/core/lib/images";

type PreviewMode = "images" | "render";

interface ListingPreviewProps {
  listing: Listing;
  variant?: "compact" | "showcase";
  className?: string;
}

export function ListingPreview({
  listing,
  variant = "showcase",
  className = "",
}: ListingPreviewProps) {
  const previewImages = useMemo(
    () => (listing.images ?? []).filter((image): image is string => Boolean(image?.trim())),
    [listing.images]
  );
  const primaryImage = previewImages[0] ?? listing.image;
  const shaderCode = listing.shader?.code ?? "";
  const canRenderShader = shaderCode.length > 0;
  const canShowImages = previewImages.length > 0;
  const [mode, setMode] = useState<PreviewMode>(canShowImages ? "images" : "render");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (variant === "compact") {
    if (canShowImages || !canRenderShader) {
      return (
        <ImageWithFallback
          src={resolveImageUrl(primaryImage)}
          alt={listing.title}
          className={className}
        />
      );
    }

    return (
      <ShaderPreview
        fragmentShader={shaderCode}
        label={`${listing.title} shader preview`}
        className={className}
      />
    );
  }

  const safeSelectedImageIndex =
    previewImages.length > 0 ? Math.min(selectedImageIndex, previewImages.length - 1) : 0;
  const activeImage = previewImages[safeSelectedImageIndex] ?? primaryImage;

  return (
    <div className={`flex h-full flex-col ${className}`.trim()}>
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white/80 px-5 py-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/70">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400">
            Preview
          </p>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {canRenderShader && canShowImages
              ? "Shader and uploaded images"
              : canShowImages
                ? "Uploaded images"
                : "Shader render"}
          </h3>
        </div>

        {canRenderShader && canShowImages && (
          <div className="inline-flex rounded-full border border-gray-200 bg-gray-100 p-1 text-sm dark:border-gray-700 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setMode("images")}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 transition-colors ${
                mode === "images"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Image className="h-4 w-4" />
              Images
            </button>
            <button
              type="button"
              onClick={() => setMode("render")}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 transition-colors ${
                mode === "render"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Render
            </button>
          </div>
        )}
      </div>

      <div className="relative min-h-[22rem] flex-1 overflow-hidden bg-gray-100 dark:bg-gray-950">
        {mode === "render" && canRenderShader ? (
          <ShaderPreview
            fragmentShader={shaderCode}
            label={`${listing.title} shader preview`}
            className="h-full w-full"
          />
        ) : (
          <ImageWithFallback
            src={resolveImageUrl(activeImage)}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {canShowImages && (
        <div className="border-t border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400">
                Uploaded images
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Choose an image to preview it in the main frame.
              </p>
            </div>
            <span className="badge-muted">{previewImages.length}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {previewImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => {
                  setSelectedImageIndex(index);
                  setMode("images");
                }}
                className={`overflow-hidden rounded-lg border transition-all ${
                  selectedImageIndex === index
                    ? "border-purple-500 ring-2 ring-purple-500/30"
                    : "border-gray-200 hover:border-purple-300 dark:border-gray-700"
                }`}
              >
                <ImageWithFallback
                  src={resolveImageUrl(image)}
                  alt={`${listing.title} image ${index + 1}`}
                  className="aspect-square h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
