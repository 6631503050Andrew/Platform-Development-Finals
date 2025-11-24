import { kv } from "@vercel/kv";

export interface FoundItem {
  id: string;
  itemName: string;
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

const ITEMS_INDEX_KEY = "items:index";

/**
 * Save a new item to Vercel KV
 */
export async function saveItem(item: FoundItem): Promise<void> {
  // Save the item
  await kv.set(`item:${item.id}`, item);

  // Add to index
  const currentIndex = (await kv.get<string[]>(ITEMS_INDEX_KEY)) || [];
  await kv.set(ITEMS_INDEX_KEY, [...currentIndex, item.id]);
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

  // Sort by createdAt descending (newest first)
  return items.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
