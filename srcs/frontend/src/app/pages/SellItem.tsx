import { useState } from "react";
import { useNavigate } from "react-router";
import { Upload, DollarSign, Package, MapPin, Tag, FileText } from "lucide-react";

export function SellItem() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    condition: "",
    location: "",
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

  const conditions = ["New", "Like New", "Excellent", "Good"];

  const engines = [
    "Unity",
    "Unreal Engine",
    "Godot",
    "GameMaker",
    "Any Engine",
    "Other",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to a database
    alert("Asset listed successfully! (This is a demo - data not actually saved)");
    navigate("/");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sell Your Game Asset</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your creation with the game dev community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Asset Preview Images
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-1">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">PNG, JPG up to 10MB</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>

            <div>
              <label
                htmlFor="title"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <Tag className="w-4 h-4" />
                Asset Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Holographic Shader Pack"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Price (USD) *
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <Package className="w-4 h-4" />
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fileFormat"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <FileText className="w-4 h-4" />
                  File Format *
                </label>
                <input
                  type="text"
                  id="fileFormat"
                  name="fileFormat"
                  required
                  value={formData.fileFormat}
                  onChange={handleChange}
                  placeholder="e.g., FBX, PNG, Shader Graph"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="engine"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <Package className="w-4 h-4" />
                  Compatible Engine *
                </label>
                <select
                  id="engine"
                  name="engine"
                  required
                  value={formData.engine}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
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
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <FileText className="w-4 h-4" />
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your asset in detail. Include features, what's included, technical specs, etc."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-colors"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              List Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}