"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRouter } from "next/navigation";

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
  finderName: string;
  finderEmail: string;
  finderPhone: string;
  pickupLocation: string;
  claimerName?: string;
  claimerEmail?: string;
  claimerPhone?: string;
  finderName: string;
  finderEmail: string;
  finderPhone: string;
  pickupLocation: string;
  claimerName?: string;
  claimerEmail?: string;
  claimerPhone?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const router = useRouter();
  const [items, setItems] = useState<FoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = useState<FoundItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoundItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Check authentication
  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.push("/landing");
    }
  }, [router]);

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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      // Remove item from local state
      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

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

  const openEditModal = (item: FoundItem) => {
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    // Validate required fields
    if (!editingItem.itemName || !editingItem.description) {
      alert("Item name and description are required");
      return;
    }

    setIsSaving(true);
    try {
      // Update via API
      const response = await fetch(`/api/items/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: editingItem.itemName,
          description: editingItem.description,
          finderName: editingItem.finderName,
          finderEmail: editingItem.finderEmail,
          finderPhone: editingItem.finderPhone,
          pickupLocation: editingItem.pickupLocation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update item");
      }

      const { item: updatedItem } = await response.json();

      // Update local state
      setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
      closeEditModal();
      alert("Item updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update item");
    } finally {
      setIsSaving(false);
    }
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

  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.itemName.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mb-6 text-lg">
          Manage all found items reported in the system
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center flex-wrap">
            <button
              onClick={fetchItems}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Items
            </button>
            <Link
              href="/user"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Item
            </Link>
            <div className="flex-1"></div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-3 rounded-lg border-l-4 border-purple-500 shadow-sm">
              <span className="text-purple-900 font-bold text-lg">{items.length}</span>
              <span className="text-purple-700 ml-2">Total Items</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search items by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
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
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl border-2 border-gray-100">
          <div className="text-6xl mb-4">{searchQuery ? "🔍" : "📦"}</div>
          <p className="text-gray-700 text-xl mb-6 font-semibold">
            {searchQuery ? `No items match "${searchQuery}"` : "No items found yet"}
          </p>
          <Link
            href="/user"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Report the first item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-300 hover:-translate-y-1"
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
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <svg className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.itemName}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {item.description}
                </p>
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <p>
                    📍{" "}
                    <a
                      href={getGoogleMapsUrl(item.latitude, item.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                    </a>
                  </p>
                  <p>
                    🕒 Found: {new Date(item.foundAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    Reported: {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* PDPA Personal Data Section */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <p className="text-xs font-semibold text-purple-700 mb-2">PDPA Contact Information:</p>
                  <div className="space-y-3">
                    {/* Finder Information */}
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs font-bold text-purple-800 mb-1">Finder (Person who found item):</p>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p className="flex items-start gap-2">
                          <span className="font-semibold min-w-[60px]">Name:</span>
                          <span className="break-words">{item.finderName}</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-semibold min-w-[60px]">Email:</span>
                          <span className="break-all">{item.finderEmail}</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-semibold min-w-[60px]">Phone:</span>
                          <span>{item.finderPhone}</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-semibold min-w-[60px]">Pickup:</span>
                          <span className="break-words">{item.pickupLocation}</span>
                        </p>
                      </div>
                    </div>
                    
                    {/* Claimer Information (if claimed) */}
                    {item.status === "claimed" && item.claimerName && (
                      <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                        <p className="text-xs font-bold text-green-800 mb-1">Claimer (Person claiming item):</p>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p className="flex items-start gap-2">
                            <span className="font-semibold min-w-[60px]">Name:</span>
                            <span className="break-words">{item.claimerName}</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <span className="font-semibold min-w-[60px]">Email:</span>
                            <span className="break-all">{item.claimerEmail}</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <span className="font-semibold min-w-[60px]">Phone:</span>
                            <span>{item.claimerPhone}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {deletingId === item.id ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
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

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-2xl font-bold">Edit Item</h3>
              <button
                onClick={closeEditModal}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Item Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={editingItem.itemName}
                  onChange={(e) => setEditingItem({ ...editingItem, itemName: e.target.value })}
                  maxLength={100}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-gray-900"
                  placeholder="e.g., Black iPhone 13"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  maxLength={500}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-gray-900"
                  placeholder="Describe the item..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editingItem.description.length}/500 characters
                </p>
              </div>

              {/* Finder Information */}
              <div className="border-t-2 border-gray-200 pt-4">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Finder Contact Information</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Finder Name *
                    </label>
                    <input
                      type="text"
                      value={editingItem.finderName}
                      onChange={(e) => setEditingItem({ ...editingItem, finderName: e.target.value })}
                      maxLength={100}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Finder Email *
                    </label>
                    <input
                      type="email"
                      value={editingItem.finderEmail}
                      onChange={(e) => setEditingItem({ ...editingItem, finderEmail: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Finder Phone *
                    </label>
                    <input
                      type="tel"
                      value={editingItem.finderPhone}
                      onChange={(e) => setEditingItem({ ...editingItem, finderPhone: e.target.value })}
                      maxLength={15}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pickup Location *
                    </label>
                    <textarea
                      value={editingItem.pickupLocation}
                      onChange={(e) => setEditingItem({ ...editingItem, pickupLocation: e.target.value })}
                      maxLength={200}
                      required
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-gray-900"
                      placeholder="Where can the owner pick up this item?"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {editingItem.pickupLocation.length}/200 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeEditModal}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
