import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Code2, DollarSign, FileText, Save, Tag } from "lucide-react";
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

  const slug = useMemo(() => slugifyShaderTitle(formData.title), [formData.title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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
      const listing = await api.createListing(
        {
          name: formData.title.trim(),
          slug,
          description: buildShaderDescription(formData.notes, formData.code),
          price,
          category: "Shaders",
          fileFormat: "GLSL",
          engine: "Three.js",
        },
        user.id
      );

      toast.success("Shader listed successfully!");
      navigate(listing?.id ? `/product/${listing.id}` : "/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to list shader";
      toast.error(message);
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
      </div>
    </div>
  );
}
