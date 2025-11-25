"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import("./components/MapPicker"), {
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
    imageUrl: "",
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!location) {
      setMessage({
        type: "error",
        text: "Location not available. Please enable location services and refresh the page.",
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

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          latitude: location.latitude,
          longitude: location.longitude,
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
        imageUrl: "",
      });
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Report Found Item
        </h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <MapPicker onLocationSelect={handleLocationSelect} />
          {location && (
            <div className="mt-3 p-3 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-sm">
              ✓ Selected location: {location.latitude.toFixed(6)},{" "}
              {location.longitude.toFixed(6)}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="itemName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Item Name *
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="e.g., Black wallet"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description *
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="Provide details about where and when you found this item..."
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="imageUrl"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Image URL (optional)
            </label>
            <input
              type="url"
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !location}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Submit Found Item"}
          </button>
        </form>
      </div>
    </div>
  );
}
