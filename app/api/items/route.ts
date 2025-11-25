import { NextRequest, NextResponse } from "next/server";
import { saveItem, getAllItems, FoundItem } from "@/lib/kv";
import {
  validateItemName,
  validateDescription,
  validateImageUrl,
  validateLatitude,
  validateLongitude,
  sanitizeString,
} from "@/lib/validation";

/**
 * GET /api/items
 * Retrieve all items
 */
export async function GET() {
  try {
    const items = await getAllItems();
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to fetch items",
        details: errorMessage,
        env: {
          hasKvUrl: !!process.env.KV_REST_API_URL,
          hasKvToken: !!process.env.KV_REST_API_TOKEN,
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/items
 * Create a new found item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { itemName, description, imageUrl, latitude, longitude, foundAt, finderName, finderEmail, finderPhone, pickupLocation } = body;

    // Validate itemName
    const itemNameValidation = validateItemName(itemName);
    if (!itemNameValidation.valid) {
      return NextResponse.json(
        { error: itemNameValidation.error },
        { status: 400 }
      );
    }

    // Validate description
    const descriptionValidation = validateDescription(description);
    if (!descriptionValidation.valid) {
      return NextResponse.json(
        { error: descriptionValidation.error },
        { status: 400 }
      );
    }

    // Validate imageUrl (optional)
    const imageUrlValidation = validateImageUrl(imageUrl || "");
    if (!imageUrlValidation.valid) {
      return NextResponse.json(
        { error: imageUrlValidation.error },
        { status: 400 }
      );
    }

    // Validate latitude
    const latValidation = validateLatitude(latitude);
    if (!latValidation.valid) {
      return NextResponse.json(
        { error: latValidation.error },
        { status: 400 }
      );
    }

    // Validate longitude
    const lngValidation = validateLongitude(longitude);
    if (!lngValidation.valid) {
      return NextResponse.json(
        { error: lngValidation.error },
        { status: 400 }
      );
    }

    // Validate foundAt timestamp
    if (!foundAt || !Date.parse(foundAt)) {
      return NextResponse.json(
        { error: "Valid date and time when item was found is required" },
        { status: 400 }
      );
    }

    // Ensure foundAt is not in the future
    if (new Date(foundAt) > new Date()) {
      return NextResponse.json(
        { error: "Date found cannot be in the future" },
        { status: 400 }
      );
    }

    // Validate personal data (PDPA required fields)
    if (!finderName || finderName.trim().length === 0) {
      return NextResponse.json(
        { error: "Finder name is required (PDPA compliance)" },
        { status: 400 }
      );
    }

    if (!finderEmail || finderEmail.trim().length === 0) {
      return NextResponse.json(
        { error: "Finder email is required (PDPA compliance)" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(finderEmail)) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    if (!finderPhone || finderPhone.trim().length === 0) {
      return NextResponse.json(
        { error: "Finder phone number is required (PDPA compliance)" },
        { status: 400 }
      );
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(finderPhone.replace(/[\s-]/g, ""))) {
      return NextResponse.json(
        { error: "Valid phone number is required (10-15 digits)" },
        { status: 400 }
      );
    }

    // Validate pickup location
    if (!pickupLocation || pickupLocation.trim().length === 0) {
      return NextResponse.json(
        { error: "Pickup location is required" },
        { status: 400 }
      );
    }

    if (pickupLocation.trim().length > 200) {
      return NextResponse.json(
        { error: "Pickup location must be 200 characters or less" },
        { status: 400 }
      );
    }

    // Create item
    const item: FoundItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemName: sanitizeString(itemName),
      description: sanitizeString(description),
      imageUrl: imageUrl || undefined, // Store base64 or URL as-is
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      foundAt: foundAt,
      createdAt: new Date().toISOString(),
      status: "lost" as const, // New field: "lost" or "claimed"
      claimedAt: null,
      claimImageUrl: null,
      finderName: sanitizeString(finderName),
      finderEmail: sanitizeString(finderEmail),
      finderPhone: sanitizeString(finderPhone.replace(/[\s-]/g, "")),
      pickupLocation: sanitizeString(pickupLocation),
    };

    // Save to KV
    await saveItem(item);

    return NextResponse.json(
      { message: "Item created successfully", item },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating item:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to create item",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
