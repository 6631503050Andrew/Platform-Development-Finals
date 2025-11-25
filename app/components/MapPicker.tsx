"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

// Fix for default marker icons in Leaflet with Next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

interface MapPickerProps {
  onLocationSelect: (latitude: number, longitude: number) => void;
  initialPosition?: [number, number];
}

export default function MapPicker({
  onLocationSelect,
  initialPosition = [19.9133, 99.8367], // Default to Mae Fah Luang University
}: MapPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // Only initialize map on client side
    if (typeof window === "undefined") return;

    // Prevent double initialization
    if (mapRef.current) return;

    // Initialize map
    const map = L.map("map-picker").setView(initialPosition, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Add click event to map
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Remove existing marker if any
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }

      // Add new marker
      const marker = L.marker([lat, lng]).addTo(map);
      markerRef.current = marker;

      // Call callback with coordinates
      onLocationSelect(lat, lng);
    });

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Check if map is still valid before using it
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 13);

            // Add marker at current location
            if (markerRef.current) {
              mapRef.current.removeLayer(markerRef.current);
            }
            const marker = L.marker([latitude, longitude]).addTo(mapRef.current);
            markerRef.current = marker;

            // Call callback with current location
            onLocationSelect(latitude, longitude);
          }
        },
        () => {
          // If geolocation fails, add marker at default position
          if (mapRef.current) {
            const marker = L.marker(initialPosition).addTo(mapRef.current);
            markerRef.current = marker;
            onLocationSelect(initialPosition[0], initialPosition[1]);
          }
        }
      );
    } else {
      // No geolocation support, use default position
      const marker = L.marker(initialPosition).addTo(map);
      markerRef.current = marker;
      onLocationSelect(initialPosition[0], initialPosition[1]);
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div
        id="map-picker"
        className="w-full h-96 rounded-lg border-2 border-gray-300 shadow-md"
      />
      <p className="mt-2 text-sm text-gray-600">
        💡 <strong>Click anywhere on the map</strong> to select the location where you
        found the item
      </p>
    </div>
  );
}
