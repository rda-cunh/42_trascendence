import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Code2,
  DollarSign,
  FileText,
  ImagePlus,
  Save,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api, ListingImageRecord } from "../lib/api";
import { ShaderPreview } from "../components/ShaderPreview";
import {
  buildShaderDescription,
  DEFAULT_FRAGMENT_SHADER,
  parseShaderDescription,
  slugifyShaderTitle,
} from "../lib/shaders";
import { useImageUpload, ImageUploadResult } from "../hooks/useImageUpload";

type EditableImage = {
  id: number | null;
  filename: string;
  previewUrl: string;
  displayOrder: number;
  isNew: boolean;
};

export function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    notes: "",
    price: "",
    code: DEFAULT_FRAGMENT_SHADER,
  });

  const [images, setImages] = useState<EditableImage[]>([]);
  const [activePreview, setActivePreview] = useState<EditableImage | null>(null);
  const [originalImages, setOriginalImages] = useState<EditableImage[]>([]);

  const imageUpload = useImageUpload({
    onSuccess: async (result: ImageUploadResult) => {
      setImages((prev) => [
        ...prev,
        {
          id: null,
          filename: result.filename,
          previewUrl: result.url,
          displayOrder: prev.length,
          isNew: true,
        },
      ]);
    },
    successMessage: "Image uploaded",
    errorContext: "image",
  });

  const slug = useMemo(() => slugifyShaderTitle(formData.title), [formData.title]);

  useEffect(() => {
    const loadListing = async () => {
      if (!id) return;

      setIsLoading(true);

      try {
        const listing = await api.getListing(id);
        const shader = parseShaderDescription(listing?.description);

        setFormData({
          title: listing?.name ?? "",
          notes: shader?.notes ?? "",
          price: listing?.price != null ? String(listing.price) : "",
          code: shader?.code ?? DEFAULT_FRAGMENT_SHADER,
        });

        const fallbackImages = Array.isArray(listing?.images)
          ? listing.images.map((filename: string, index: number) => ({
              id: null,
              filename,
              previewUrl: `/images/${filename}`,
              displayOrder: index,
              isNew: false,
            }))
          : [];

        setImages(fallbackImages);
        setOriginalImages(fallbackImages);

        try {
          const listingImages = await api.getListingImages(id);
          const imageRecords = Array.isArray(listingImages) ? listingImages : [];
          const hydratedImages = imageRecords.map((image: ListingImageRecord) => ({
            id: image.id,
            filename: image.image_hash,
            previewUrl: `/images/${image.image_hash}`,
            displayOrder: image.display_order,
            isNew: false,
          }));

          setImages(hydratedImages);
          setOriginalImages(hydratedImages);
        } catch {
          toast.error("Listing loaded, but image metadata could not be loaded.");
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load listing");
      } finally {
        setIsLoading(false);
      }
    };

    void loadListing();
  }, [id]);

  const handleRemoveImage = (filename: string) => {
    setImages((prev) =>
      prev
        .filter((image) => image.filename !== filename)
        .map((image, index) => ({
          ...image,
          displayOrder: index,
        }))
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!id) return;

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

    setIsSaving(true);

    try {
      await api.updateListing(id, {
        name: trimmedTitle,
        slug,
        description: buildShaderDescription(formData.notes, formData.code),
        price,
      });

      const currentExistingIds = new Set(
        images.filter((image) => image.id != null).map((image) => image.id as number)
      );

      const removedOriginalImages = originalImages.filter(
        (image) => image.id != null && !currentExistingIds.has(image.id)
      );

      for (const image of removedOriginalImages) {
        await api.deleteListingImage(id, image.id as number);
      }

      for (const image of images.filter((entry) => entry.isNew)) {
        await api.addListingImage(id, image.filename, image.displayOrder);
      }

      toast.success("Listing updated successfully!");
      navigate(`/product/${id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update listing");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-page flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading listing...</p>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="app-container">
        <Link
          to={`/product/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listing
        </Link>

        <div className="page-header">
          <h1 className="page-title">Edit Shader</h1>
          <p className="page-description">
            Update the shader source, notes, price, and gallery for this listing.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]"
        >
          <div className="surface-padded space-y-6">
            <div>
              <label className="form-label">
                <Tag className="h-4 w-4" /> Shader Title
              </label>
              <input
                type="text"
                required
                minLength={3}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-control"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Slug: {slug}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="form-label">
                  <DollarSign className="h-4 w-4" /> Price
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="form-control"
                />
              </div>

              <div>
                <label className="form-label">
                  <Code2 className="h-4 w-4" /> Category
                </label>
                <input type="text" value="Shaders" disabled className="form-control" />
              </div>
            </div>

            <div>
              <label className="form-label">
                <FileText className="h-4 w-4" /> Notes
              </label>
              <textarea
                required
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">
                <ImagePlus className="h-4 w-4" /> Images
              </label>

              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => imageUpload.setSelectedFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                  id="edit-listing-image-input"
                />

                <label
                  htmlFor="edit-listing-image-input"
                  className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <ImagePlus className="mb-2 h-5 w-5 text-gray-500 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {imageUpload.selectedFile ? imageUpload.selectedFile.name : "Choose an image"}
                  </span>
                  <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Click to open your files
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => void imageUpload.handleUpload()}
                  disabled={!imageUpload.selectedFile || imageUpload.isUploading}
                  className="btn-secondary h-10 w-40"
                >
                  <Upload className="h-4 w-4" />
                  <span>{imageUpload.isUploading ? "Uploading..." : "Upload image"}</span>
                </button>
              </div>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {images.map((image) => (
                  <div
                    key={`${image.filename}-${image.id ?? "new"}`}
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
              <label className="form-label">
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

            <div className="flex gap-4">
              <Link to={`/product/${id}`} className="btn-secondary flex-1 py-3 text-center">
                Cancel
              </Link>
              <button type="submit" disabled={isSaving} className="btn-primary flex-1 py-3">
                <Save className="h-5 w-5" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>

          <div className="surface h-fit p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-900 dark:text-white">Live Preview</h2>
              <span className="badge-muted">Three.js</span>
            </div>
            <ShaderPreview
              fragmentShader={formData.code}
              label="Edited shader live preview"
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
                className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
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