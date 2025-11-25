"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FoundItem {
  id: string;
  itemName: string;
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  foundAt: string;
  createdAt: string;
  status: "lost" | "claimed";
  claimedAt: string | null;
  claimImageUrl?: string | null;
}

export default function UserDashboard() {
  const [items, setItems] = useState<FoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = useState<FoundItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimImageFile, setClaimImageFile] = useState<File | null>(null);
  const [claimImagePreview, setClaimImagePreview] = useState<string | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/items");
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }
      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const getGoogleMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  };

  const openLightbox = (item: FoundItem) => {
    setLightboxItem(item);
    if (item.imageUrl) {
      setLightboxImage(item.imageUrl);
    }
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setLightboxItem(null);
  };

  const getTimeRemaining = (claimedAt: string) => {
    const claimDate = new Date(claimedAt);
    const expiryDate = new Date(claimDate.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    const now = new Date();
    const diff = expiryDate.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleClaimClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setShowClaimModal(true);
  };

  const handleClaimImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }
      setClaimImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setClaimImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitClaim = async () => {
    if (!selectedItemId || !claimImagePreview) {
      alert("Please upload a proof image");
      return;
    }

    setClaimingId(selectedItemId);
    try {
      const response = await fetch(`/api/items/${selectedItemId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimImageUrl: claimImagePreview }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to claim item");
      }

      // Refresh items
      await fetchItems();
      
      // Close modal and reset
      setShowClaimModal(false);
      setSelectedItemId(null);
      setClaimImageFile(null);
      setClaimImagePreview(null);
      
      alert("Item claimed successfully! The item will expire in 3 days.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to claim item");
    } finally {
      setClaimingId(null);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-red-800 bg-clip-text text-transparent mb-2">
          Lost & Found Items
        </h1>
        <p className="text-gray-600 mb-6 text-lg">
          Browse items that have been found. If you see something that belongs to you, please contact the administrator.
        </p>

        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search items by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 text-gray-900 shadow-sm transition-all duration-200 hover:border-red-300"
            />
          </div>
          <button
            onClick={fetchItems}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-l-4 border-red-500 shadow-md">
          <div className="flex items-center">
            <span className="text-lg mr-2">⚠</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-700"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl border-2 border-gray-100">
          <div className="text-6xl mb-4">{searchQuery ? "🔍" : "📦"}</div>
          <p className="text-gray-700 text-xl mb-6 font-semibold">
            {searchQuery ? "No items match your search" : "No items found yet"}
          </p>
          <Link
            href="/user"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Report a found item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-red-400 hover:-translate-y-1"
            >
              {item.imageUrl && (
                <div
                  className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden cursor-pointer group relative"
                  onClick={() => openLightbox(item)}
                  title="Click to view full image"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.itemName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {item.status === "claimed" ? (
                      <div className="flex flex-col gap-1">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          CLAIMED
                        </span>
                        {item.claimedAt && (
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg text-center">
                            ⏱ {getTimeRemaining(item.claimedAt)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        LOST
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.itemName}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {item.description}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>
                    📍{" "}
                    <a
                      href={getGoogleMapsUrl(item.latitude, item.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View on Map
                    </a>
                  </p>
                  <p>🕒 Found: {new Date(item.foundAt).toLocaleString()}</p>
                </div>
                
                {/* Claim Button */}
                {item.status === "lost" && (
                  <button
                    onClick={() => handleClaimClick(item.id)}
                    className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Claim This Item
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Modal */}
      {showClaimModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowClaimModal(false);
            setClaimImagePreview(null);
            setClaimImageFile(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Claim Item</h3>
              <button
                onClick={() => {
                  setShowClaimModal(false);
                  setClaimImagePreview(null);
                  setClaimImageFile(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Please upload a photo of the item as proof of ownership.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                📷 Proof Image *
              </label>
              <div className="flex gap-3">
                <label
                  htmlFor="claimImageFile"
                  className="flex-1 cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-2 border-gray-300 rounded-lg hover:from-green-50 hover:to-green-100 hover:border-green-400 transition-all duration-200 flex items-center justify-center gap-2 text-gray-700 font-medium shadow-sm"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Choose Photo
                </label>
                <input
                  type="file"
                  id="claimImageFile"
                  accept="image/*"
                  onChange={handleClaimImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="claimCameraCapture"
                  className="cursor-pointer bg-gradient-to-r from-teal-50 to-teal-100 px-5 py-3 border-2 border-teal-300 rounded-lg hover:from-teal-100 hover:to-teal-200 hover:border-teal-400 transition-all duration-200 flex items-center justify-center text-teal-800 font-medium shadow-sm"
                  title="Take Photo"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                <input
                  type="file"
                  id="claimCameraCapture"
                  accept="image/*"
                  capture="environment"
                  onChange={handleClaimImageChange}
                  className="hidden"
                />
              </div>

              {claimImagePreview && (
                <div className="mt-4 relative rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={claimImagePreview}
                    alt="Claim proof"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setClaimImagePreview(null);
                      setClaimImageFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all duration-200 shadow-lg"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmitClaim}
              disabled={!claimImagePreview || claimingId !== null}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {claimingId ? "Claiming..." : "Submit Claim"}
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && lightboxItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            title="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
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

          {/* Content */}
          <div className="max-w-7xl w-full" onClick={(e) => e.stopPropagation()}>
            {lightboxItem.status === "claimed" && lightboxItem.claimImageUrl ? (
              /* Side by Side View for Claimed Items */
              <div className="grid md:grid-cols-2 gap-6">
                {/* Original Found Item */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-red-600 text-white px-4 py-3 font-bold text-center">
                    📦 Original Found Item
                  </div>
                  <div className="p-4">
                    <img
                      src={lightboxItem.imageUrl}
                      alt={lightboxItem.itemName}
                      className="w-full h-96 object-contain bg-gray-100 rounded-lg"
                    />
                    <div className="mt-4 text-gray-800">
                      <h3 className="text-xl font-bold mb-2">{lightboxItem.itemName}</h3>
                      <p className="text-sm text-gray-600">{lightboxItem.description}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        🕒 Found: {new Date(lightboxItem.foundAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Claimed Proof Image */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-green-600 text-white px-4 py-3 font-bold text-center">
                    ✅ Claim Proof Image
                  </div>
                  <div className="p-4">
                    <img
                      src={lightboxItem.claimImageUrl}
                      alt="Claim proof"
                      className="w-full h-96 object-contain bg-gray-100 rounded-lg"
                    />
                    <div className="mt-4 text-gray-800">
                      <p className="text-sm text-gray-600">
                        This image was submitted as proof of ownership when claiming the item.
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        🕒 Claimed: {new Date(lightboxItem.claimedAt!).toLocaleString()}
                      </p>
                      {lightboxItem.claimedAt && (
                        <p className="text-sm font-semibold text-yellow-600 mt-2">
                          ⏱ Expires in: {getTimeRemaining(lightboxItem.claimedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Single Image View for Unclaimed Items */
              <div className="flex items-center justify-center">
                <img
                  src={lightboxImage}
                  alt="Full size"
                  className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
