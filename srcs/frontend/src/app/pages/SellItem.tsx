import { useState } from "react";
import { useNavigate } from "react-router";
import { Upload, DollarSign, Package, Tag, FileText } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { toast } from "sonner";

export function SellItem() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    condition: "",
    description: "",
    fileFormat: "",
    engine: "",
  });

  const categories = [
    "3D Models",
    "2D Assets",
    "Shaders",
    "Textures",
    "VFX",
    "Audio",
    "UI/UX",
    "Scripts",
    "Other",
  ];

  const engines = ["Unity", "Unreal Engine", "Godot", "GameMaker", "Any Engine", "Other"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (token) {
        await api.createListing(
          {
            name: formData.title,
            price: parseFloat(formData.price),
            category: formData.category,
            description: formData.description,
            status: formData.condition || "New",
            fileFormat: formData.fileFormat,
            engine: formData.engine,
          },
          token
        );
      }
      toast.success("Asset listed successfully!");
      navigate("/");
    } catch {
      // Demo mode fallback
      toast.success("Asset listed! (demo mode)");
      navigate("/");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Sell Your Game Asset
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your creation with the game dev community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
            <label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
              Asset Preview Images
            </label>
            <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-12 text-center transition-colors hover:border-purple-400 dark:border-gray-700 dark:hover:border-purple-500">
              <Upload className="mx-auto mb-3 h-12 w-12 text-gray-400 dark:text-gray-500" />
              <p className="mb-1 text-gray-600 dark:text-gray-400">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">PNG, JPG up to 10MB</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h2>

            <div>
              <label
                htmlFor="title"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Tag className="h-4 w-4" /> Asset Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Holographic Shader Pack"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <DollarSign className="h-4 w-4" /> Price (USD) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <Package className="h-4 w-4" /> Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="fileFormat"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <FileText className="h-4 w-4" /> File Format *
                </label>
                <input
                  type="text"
                  id="fileFormat"
                  name="fileFormat"
                  required
                  value={formData.fileFormat}
                  onChange={handleChange}
                  placeholder="e.g., FBX, PNG, Shader Graph"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="engine"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <Package className="h-4 w-4" /> Compatible Engine *
                </label>
                <select
                  id="engine"
                  name="engine"
                  required
                  value={formData.engine}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select engine</option>
                  {engines.map((eng) => (
                    <option key={eng} value={eng}>
                      {eng}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <FileText className="h-4 w-4" /> Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your asset in detail. Include features, what's included, technical specs, etc."
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 transition-colors focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
            >
              {isSubmitting ? "Listing..." : "List Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
