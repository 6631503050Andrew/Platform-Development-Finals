import { NextRequest, NextResponse } from "next/server";
import { saveItem, getAllItems } from "@/lib/kv";
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
    return NextResponse.json(
      { error: "Failed to fetch items" },
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

    const { itemName, description, imageUrl, latitude, longitude } = body;

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

    // Create item
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemName: sanitizeString(itemName),
      description: sanitizeString(description),
      imageUrl: imageUrl ? sanitizeString(imageUrl) : undefined,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      createdAt: new Date().toISOString(),
    };

    // Save to KV
    await saveItem(item);

    return NextResponse.json(
      { message: "Item created successfully", item },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
