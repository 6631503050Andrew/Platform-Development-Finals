import { kv } from "@vercel/kv";

export interface FoundItem {
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
  // Personal Data (PDPA)
  finderName: string;
  finderEmail: string;
  finderPhone: string;
  pickupLocation: string;
  // Claimer Personal Data (PDPA)
  claimerName?: string;
  claimerEmail?: string;
  claimerPhone?: string;
}

const ITEMS_INDEX_KEY = "items:index";

/**
 * Save a new item to Vercel KV
 */
export async function saveItem(item: FoundItem): Promise<void> {
  // Save the item
  await kv.set(`item:${item.id}`, item);

  // Add to index only if it doesn't exist
  const currentIndex = (await kv.get<string[]>(ITEMS_INDEX_KEY)) || [];
  if (!currentIndex.includes(item.id)) {
    await kv.set(ITEMS_INDEX_KEY, [...currentIndex, item.id]);
  }
}

/**
 * Get all items from Vercel KV
 */
export async function getAllItems(): Promise<FoundItem[]> {
  const itemIds = (await kv.get<string[]>(ITEMS_INDEX_KEY)) || [];

  if (itemIds.length === 0) {
    return [];
  }

  // Fetch all items
  const items: FoundItem[] = [];
  for (const id of itemIds) {
    const item = await kv.get<FoundItem>(`item:${id}`);
    if (item) {
      items.push(item);
    }
  }

  // Sort by foundAt descending (most recently found first)
  return items.sort(
    (a, b) =>
      new Date(b.foundAt).getTime() - new Date(a.foundAt).getTime()
  );
}

/**
 * Delete an item from Vercel KV
 */
export async function deleteItem(id: string): Promise<boolean> {
  // Check if item exists
  const item = await kv.get<FoundItem>(`item:${id}`);
  if (!item) {
    return false;
  }

  // Delete the item
  await kv.del(`item:${id}`);

  // Remove from index
  const currentIndex = (await kv.get<string[]>(ITEMS_INDEX_KEY)) || [];
  const newIndex = currentIndex.filter((itemId) => itemId !== id);
  await kv.set(ITEMS_INDEX_KEY, newIndex);

  return true;
}

/**
 * Get a single item by ID
 */
export async function getItemById(id: string): Promise<FoundItem | null> {
  return await kv.get<FoundItem>(`item:${id}`);
}
