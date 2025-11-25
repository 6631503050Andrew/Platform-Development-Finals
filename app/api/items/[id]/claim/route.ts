import { NextRequest, NextResponse } from "next/server";
import { getItemById, saveItem, FoundItem } from "@/lib/kv";
import { validateImageUrl } from "@/lib/validation";

/**
 * POST /api/items/[id]/claim
 * Claim an item with proof image
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { claimImageUrl } = body;

    // Get existing item
    const item = await getItemById(id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if already claimed
    if (item.status === "claimed") {
      return NextResponse.json(
        { error: "Item has already been claimed" },
        { status: 400 }
      );
    }

    // Validate claim image
    if (!claimImageUrl) {
      return NextResponse.json(
        { error: "Proof image is required to claim an item" },
        { status: 400 }
      );
    }

    const imageValidation = validateImageUrl(claimImageUrl);
    if (!imageValidation.valid) {
      return NextResponse.json(
        { error: imageValidation.error },
        { status: 400 }
      );
    }

    // Update item with claim information
    const updatedItem: FoundItem = {
      ...item,
      status: "claimed" as const,
      claimedAt: new Date().toISOString(),
      claimImageUrl: claimImageUrl,
    };

    // Save updated item
    await saveItem(updatedItem);

    return NextResponse.json(
      { message: "Item claimed successfully", item: updatedItem },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error claiming item:", error);
    return NextResponse.json(
      { error: "Failed to claim item" },
      { status: 500 }
    );
  }
}
