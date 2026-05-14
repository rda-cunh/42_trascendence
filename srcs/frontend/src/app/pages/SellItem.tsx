import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Code2, DollarSign, FileText, ImagePlus, Save, Tag, Trash2, Upload, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ShaderPreview } from "../components/ShaderPreview";
import { api } from "../lib/api";
import {
  buildShaderDescription,
  DEFAULT_FRAGMENT_SHADER,
  slugifyShaderTitle,
} from "../lib/shaders";
import { toast } from "sonner";

export function SellItem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    notes: "",
    price: "",
    code: DEFAULT_FRAGMENT_SHADER,
  });

  type UploadedImage = {
    filename: string;
    previewUrl: string;
  };

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activePreview, setActivePreview] = useState<UploadedImage | null>(null);

  const handleImageUpload = async () => {
    if (!selectedImage) {
      toast.error("Please choose an image first");
      return;
    }

    setIsUploadingImage(true);

    try {
      const result = await api.uploadImage(selectedImage);
      const previewUrl = result.url ?? `/images/${result.filename}`;

      setUploadedImages((prev) => [
        ...prev,
        {
          filename: result.filename,
          previewUrl,
        },
      ]);

      setSelectedImage(null);
      toast.success("Image uploaded");
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload image";
      toast.error(message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = (filename: string) => {
    setUploadedImages((prev) => prev.filter((image) => image.filename !== filename));
  };

  const slug = useMemo(() => slugifyShaderTitle(formData.title), [formData.title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedTitle = formData.title.trim();
    if (trimmedTitle.length < 3) {
      toast.error("Title must be at least 3 characters long");
      return;
    }

    if (!slug || slug.length < 3) {
      toast.error("Title must contain letters or numbers to generate a valid slug");
      return;
    }

    const price = Number.parseFloat(formData.price);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Price must be higher than zero");
      return;
    }

    if (!formData.code.includes("void main")) {
      toast.error("Shader source must include a void main function");
      return;
    }

    setIsLoading(true);

    try {
      const sellerIdRaw = user.id;
      const sellerId = Number(sellerIdRaw);

      if (!Number.isInteger(sellerId) || sellerId <= 0) {
        toast.error("Could not resolve a valid seller account. Please log out and log in again.");
        return;
      }

      const listing = await api.createListing(
        {
          name: trimmedTitle,
          user_id: sellerId,
          slug,
          description: buildShaderDescription(formData.notes, formData.code),
          price,
          images: uploadedImages.map((image) => image.filename),
        }
      );

      const listingId = listing?.id ?? listing?.product_id;

      toast.success("Shader listed successfully!");
      if (listingId) {
        navigate(`/product/${String(listingId)}`);
      } else {
        toast("Shader published, but the listing page could not be opened automatically.");
        navigate("/");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to list shader";
      const lowered = message.toLowerCase();

      if (
        lowered.includes("seller_id") ||
        lowered.includes("invalid reference") ||
        lowered.includes("fk") ||
        lowered.includes("query") ||
        lowered.includes("field required")
      ) {
        toast.error("Publishing is temporarily unavailable due to a server listing configuration issue.");
      } else {
        toast.error(message);
      }

      if (import.meta.env.DEV) {
        console.error("SellItem publish failed", {
          message,
          slug,
          userId: user.id,
          resolvedSellerId: user.id,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Sign in required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Please log in to publish a shader</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Publish Shader</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create a pure-code shader listing with a live browser preview.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]"
        >
          <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                <Tag className="h-4 w-4" /> Shader Title
              </label>
              <input
                type="text"
                required
                minLength={3}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Slug: {slug}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                  <DollarSign className="h-4 w-4" /> Price
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                  <Code2 className="h-4 w-4" /> Category
                </label>
                <input
                  type="text"
                  value="Shaders"
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                <FileText className="h-4 w-4" /> Notes
              </label>
              <textarea
                required
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                rows={4}
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                <ImagePlus className="h-4 w-4" /> Images
              </label>

              <div className="flex flex-col gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] ?? null)}
                  className="hidden"
                  id="sell-item-image-input"
                />

                <label
                  htmlFor="sell-item-image-input"
                  className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <ImagePlus className="mb-2 h-5 w-5 text-gray-500 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedImage ? selectedImage.name : "Choose an image"}
                  </span>
                  <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Click to open your files
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={!selectedImage || isUploadingImage}
                  className="inline-flex h-10 w-40 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <Upload className="h-4 w-4" />
                  <span>{isUploadingImage ? "Uploading..." : "Upload image"}</span>
                </button>
              </div>
            </div>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {uploadedImages.map((image) => (
                  <div
                    key={image.filename}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
                      <button
                        type="button"
                        onClick={() => setActivePreview(image)}
                        className="block aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-900"
                      >
                        <img
                          src={image.previewUrl}
                          alt={image.filename}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-2">
                      <p className="truncate text-xs text-gray-600 dark:text-gray-300">
                        {image.filename}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image.filename)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                        aria-label={`Remove ${image.filename}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                <Code2 className="h-4 w-4" /> Fragment Shader
              </label>
              <textarea
                required
                spellCheck={false}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="min-h-[420px] w-full resize-y rounded-lg border border-gray-300 bg-gray-950 px-4 py-3 font-mono text-sm leading-relaxed text-gray-100 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              <span>{isLoading ? "Publishing..." : "Publish Shader"}</span>
            </button>
          </div>

          <div className="h-fit rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-900 dark:text-white">Live Preview</h2>
              <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                Three.js
              </span>
            </div>
            <ShaderPreview
              fragmentShader={formData.code}
              label="New shader live preview"
              className="aspect-square w-full rounded-lg"
            />
          </div>
        </form>
        {activePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="relative max-h-[90vh] max-w-[90vw]">
              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              >
                <X className="h-5 w-5" />
              </button>

              <img
                src={activePreview.previewUrl}
                alt={activePreview.filename}
                className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
              />
            </div>

            <button
              type="button"
              onClick={() => setActivePreview(null)}
              className="absolute inset-0 -z-10 cursor-default"
              aria-label="Close image preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
