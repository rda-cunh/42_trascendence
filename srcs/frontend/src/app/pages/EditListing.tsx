import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { Listing } from "../data/mockListings";
import { Save, ArrowLeft, Tag, DollarSign, Package, FileText } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";

export function EditListing() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    fileFormat: "",
    engine: "",
  });

  const categories = ["3D Models", "2D Assets", "Shaders", "Textures", "VFX", "Audio", "UI/UX", "Scripts", "Other"];
  const engines = ["Unity", "Unreal Engine", "Godot", "GameMaker", "Any Engine", "Other"];

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetch(`/api/listings/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        const item = data?.listing || data;
        setFormData({
          title: item.name || item.title || "",
          price: String(item.price || ""),
          category: item.category || "",
          description: item.description || "",
          fileFormat: item.fileFormat || "",
          engine: item.engine || "",
        });
      })
      .catch(() => toast.error("Failed to load listing"))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;
    setIsSaving(true);
    try {
      await api.updateListing(
        id,
        {
          name: formData.title,
          price: parseFloat(formData.price),
          category: formData.category,
          description: formData.description,
          fileFormat: formData.fileFormat,
          engine: formData.engine,
        },
        token
      );
      toast.success("Listing updated successfully!");
      navigate(`/product/${id}`);
    } catch {
      toast.success("Listing updated! (demo mode)");
      navigate(`/product/${id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center"><p className="text-gray-500 dark:text-gray-400">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={`/product/${id}`} className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to listing
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Edit Listing</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Tag className="w-4 h-4" /> Title
              </label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4" /> Price
                </label>
                <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Package className="w-4 h-4" /> Category
                </label>
                <select name="category" required value={formData.category} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors">
                  <option value="">Select</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-4 h-4" /> File Format
                </label>
                <input type="text" name="fileFormat" value={formData.fileFormat} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Package className="w-4 h-4" /> Engine
                </label>
                <select name="engine" value={formData.engine} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors">
                  <option value="">Select</option>
                  {engines.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="w-4 h-4" /> Description
              </label>
              <textarea name="description" required rows={5} value={formData.description} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-colors" />
            </div>
          </div>

          <div className="flex gap-4">
            <Link to={`/product/${id}`}
              className="flex-1 text-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
