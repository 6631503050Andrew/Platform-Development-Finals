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
    const { claimImageUrl, claimerName, claimerEmail, claimerPhone } = body;

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

    // Validate claim image (optional, but must be valid if provided)
    if (claimImageUrl) {
      const imageValidation = validateImageUrl(claimImageUrl);
      if (!imageValidation.valid) {
        return NextResponse.json(
          { error: imageValidation.error },
          { status: 400 }
        );
      }
    }

    // Validate claimer personal data (PDPA)
    if (!claimerName || claimerName.trim().length === 0) {
      return NextResponse.json(
        { error: "Your name is required (PDPA compliance)" },
        { status: 400 }
      );
    }

    if (!claimerEmail || claimerEmail.trim().length === 0) {
      return NextResponse.json(
        { error: "Your email is required (PDPA compliance)" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(claimerEmail)) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    if (!claimerPhone || claimerPhone.trim().length === 0) {
      return NextResponse.json(
        { error: "Your phone number is required (PDPA compliance)" },
        { status: 400 }
      );
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(claimerPhone.replace(/[\s-]/g, ""))) {
      return NextResponse.json(
        { error: "Valid phone number is required (10-15 digits)" },
        { status: 400 }
      );
    }

    // Update item with claim information
    const updatedItem: FoundItem = {
      ...item,
      status: "claimed" as const,
      claimedAt: new Date().toISOString(),
      claimImageUrl: claimImageUrl || null,
      claimerName: claimerName.trim(),
      claimerEmail: claimerEmail.trim(),
      claimerPhone: claimerPhone.replace(/[\s-]/g, ""),
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
