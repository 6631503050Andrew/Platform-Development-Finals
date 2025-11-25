import { NextRequest, NextResponse } from "next/server";
import { deleteItem, getItemById, saveItem } from "@/lib/kv";
import {
  sanitizeString,
  validateItemName,
  validateDescription,
} from "@/lib/validation";

/**
 * PUT /api/items/[id]
 * Update an existing item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Check if item exists
    const existingItem = await getItemById(id);
    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      itemName,
      description,
      finderName,
      finderEmail,
      finderPhone,
      pickupLocation,
    } = body;

    // Validate item name
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

    // Validate PDPA fields
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

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(finderPhone.replace(/[\s-]/g, ""))) {
      return NextResponse.json(
        { error: "Valid phone number is required (10-15 digits)" },
        { status: 400 }
      );
    }

    if (!pickupLocation || pickupLocation.trim().length === 0) {
      return NextResponse.json(
        { error: "Pickup location is required" },
        { status: 400 }
      );
    }

    if (pickupLocation.length > 200) {
      return NextResponse.json(
        { error: "Pickup location must be 200 characters or less" },
        { status: 400 }
      );
    }

    // Update item (preserve original metadata)
    const updatedItem = {
      ...existingItem,
      itemName: sanitizeString(itemName),
      description: sanitizeString(description),
      finderName: sanitizeString(finderName),
      finderEmail: sanitizeString(finderEmail),
      finderPhone: finderPhone.replace(/[\s-]/g, ""),
      pickupLocation: sanitizeString(pickupLocation),
    };

    await saveItem(updatedItem);

    return NextResponse.json(
      { item: updatedItem },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/items/[id]
 * Delete a specific item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Check if item exists
    const item = await getItemById(id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete item
    const deleted = await deleteItem(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete item" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Item deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
