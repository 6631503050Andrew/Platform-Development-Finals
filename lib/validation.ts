/**
 * Sanitize user input by removing HTML tags and trimming
 */
export function sanitizeString(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Validate item name
 */
export function validateItemName(itemName: string): {
  valid: boolean;
  error?: string;
} {
  const sanitized = sanitizeString(itemName);

  if (!sanitized || sanitized.length === 0) {
    return { valid: false, error: "Item name is required" };
  }

  if (sanitized.length > 100) {
    return { valid: false, error: "Item name must be 100 characters or less" };
  }

  return { valid: true };
}

/**
 * Validate description
 */
export function validateDescription(description: string): {
  valid: boolean;
  error?: string;
} {
  const sanitized = sanitizeString(description);

  if (!sanitized || sanitized.length === 0) {
    return { valid: false, error: "Description is required" };
  }

  if (sanitized.length > 500) {
    return {
      valid: false,
      error: "Description must be 500 characters or less",
    };
  }

  return { valid: true };
}

/**
 * Validate image URL
 */
export function validateImageUrl(url: string): {
  valid: boolean;
  error?: string;
} {
  if (!url || url.trim().length === 0) {
    return { valid: true }; // Optional field
  }

  const sanitized = sanitizeString(url);

  if (sanitized.length > 500) {
    return { valid: false, error: "Image URL must be 500 characters or less" };
  }

  try {
    const parsed = new URL(sanitized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, error: "Image URL must use HTTP or HTTPS" };
    }
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  return { valid: true };
}

/**
 * Validate latitude
 */
export function validateLatitude(lat: number): {
  valid: boolean;
  error?: string;
} {
  if (typeof lat !== "number" || isNaN(lat)) {
    return { valid: false, error: "Invalid latitude" };
  }

  if (lat < -90 || lat > 90) {
    return { valid: false, error: "Latitude must be between -90 and 90" };
  }

  return { valid: true };
}

/**
 * Validate longitude
 */
export function validateLongitude(lng: number): {
  valid: boolean;
  error?: string;
} {
  if (typeof lng !== "number" || isNaN(lng)) {
    return { valid: false, error: "Invalid longitude" };
  }

  if (lng < -180 || lng > 180) {
    return { valid: false, error: "Longitude must be between -180 and 180" };
  }

  return { valid: true };
}
