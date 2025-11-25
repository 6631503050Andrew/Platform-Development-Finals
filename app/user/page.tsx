"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import("../components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function Home() {
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    foundDate: "",
    foundTime: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleLocationSelect = (latitude: number, longitude: number) => {
    setLocation({ latitude, longitude });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "Image size must be less than 5MB",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setMessage({
          type: "error",
          text: "Please select a valid image file",
        });
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!location) {
      setMessage({
        type: "error",
        text: "Please select a location on the map.",
      });
      return;
    }

    if (!formData.itemName.trim() || !formData.description.trim()) {
      setMessage({
        type: "error",
        text: "Item name and description are required.",
      });
      return;
    }

    if (!formData.foundDate || !formData.foundTime) {
      setMessage({
        type: "error",
        text: "Please specify when you found the item.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = "";

      // Convert image to base64 if provided
      if (imageFile) {
        const reader = new FileReader();
        imageUrl = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      // Combine date and time into ISO string
      const foundDateTime = new Date(`${formData.foundDate}T${formData.foundTime}`).toISOString();

      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemName: formData.itemName,
          description: formData.description,
          imageUrl,
          latitude: location.latitude,
          longitude: location.longitude,
          foundAt: foundDateTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit item");
      }

      setMessage({
        type: "success",
        text: "Item submitted successfully!",
      });

      // Reset form
      setFormData({
        itemName: "",
        description: "",
        foundDate: "",
        foundTime: "",
      });
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to submit item",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-red-800 bg-clip-text text-transparent mb-2">
          Report Found Item
        </h1>
        <p className="text-gray-600 mb-8">Fill in the details to help reunite the owner with their item</p>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg shadow-md ${
              message.type === "success"
                ? "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-l-4 border-green-500"
                : "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-l-4 border-red-500"
            }`}
          >
            <div className="flex items-center">
              <span className="text-lg mr-2">{message.type === "success" ? "✓" : "⚠"}</span>
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            📍 Location *
          </label>
          <div className="rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
            <MapPicker onLocationSelect={handleLocationSelect} />
          </div>
          {location && (
            <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-teal-50 to-teal-100 text-teal-800 border-l-4 border-teal-600 text-sm shadow-sm">
              <span className="font-semibold">✓ Location selected:</span> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="itemName"
              className="block text-sm font-semibold text-gray-800 mb-2"
            >
              📦 Item Name *
            </label>
            <input
              type="text"
              id="itemName"
              value={formData.itemName}
              onChange={(e) =>
                setFormData({ ...formData, itemName: e.target.value })
              }
              maxLength={100}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 transition-all duration-200 shadow-sm hover:border-red-300"
              placeholder="e.g., Black wallet, iPhone 14, Student ID"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-800 mb-2"
            >
              📝 Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              maxLength={500}
              required
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 transition-all duration-200 shadow-sm hover:border-red-300"
              placeholder="Provide details about where and when you found this item..."
            />
            <p className="mt-2 text-sm text-gray-500 font-medium">
              {formData.description.length}/500 characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="foundDate"
                className="block text-sm font-semibold text-gray-800 mb-2"
              >
                📅 Date Found *
              </label>
              <input
                type="date"
                id="foundDate"
                value={formData.foundDate}
                onChange={(e) =>
                  setFormData({ ...formData, foundDate: e.target.value })
                }
                max={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 transition-all duration-200 shadow-sm hover:border-red-300"
              />
            </div>

            <div>
              <label
                htmlFor="foundTime"
                className="block text-sm font-semibold text-gray-800 mb-2"
              >
                🕐 Time Found *
              </label>
              <input
                type="time"
                id="foundTime"
                value={formData.foundTime}
                onChange={(e) =>
                  setFormData({ ...formData, foundTime: e.target.value })
                }
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 transition-all duration-200 shadow-sm hover:border-red-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              📷 Image (optional)
            </label>
            <div className="flex gap-3">
              <label
                htmlFor="imageFile"
                className="flex-1 cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-2 border-gray-300 rounded-lg hover:from-red-50 hover:to-red-100 hover:border-red-400 transition-all duration-200 flex items-center justify-center gap-2 text-gray-700 font-medium shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Choose Photo
              </label>
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="cameraCapture"
                className="cursor-pointer bg-gradient-to-r from-teal-50 to-teal-100 px-5 py-3 border-2 border-teal-300 rounded-lg hover:from-teal-100 hover:to-teal-200 hover:border-teal-400 transition-all duration-200 flex items-center justify-center text-teal-800 font-medium shadow-sm"
                title="Take Photo"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </label>
              <input
                type="file"
                id="cameraCapture"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Max file size: 5MB. Supported formats: JPG, PNG, GIF
            </p>

            {imagePreview && (
              <div className="mt-4 relative rounded-xl overflow-hidden shadow-lg">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all duration-200 shadow-lg hover:scale-110"
                  title="Remove image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !location}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Found Item"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
