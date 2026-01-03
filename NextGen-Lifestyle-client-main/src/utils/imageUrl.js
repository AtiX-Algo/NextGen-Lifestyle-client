// src/utils/imageUrl.js

// Your backend base URL (must match server port)
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Convert any image path from DB into a browser-loadable URL.
 * 
 * Handles:
 * 1. Full URLs (http/https)
 * 2. Absolute paths (/images/...)
 * 3. Relative paths (images/...)
 * 4. Filenames (image.jpg)
 * 5. Arrays of images (uses first image)
 */
export function toImageUrl(img) {
  // Handle null/undefined
  if (!img) {
    console.warn('No image provided to toImageUrl');
    return '/placeholder-image.jpg'; // Fallback placeholder
  }

  // Handle arrays (use first image)
  if (Array.isArray(img)) {
    return toImageUrl(img[0]);
  }

  // Convert to string in case it's a number or other type
  const imgStr = String(img).trim();

  // Already a full URL
  if (imgStr.startsWith('http://') || imgStr.startsWith('https://')) {
    return imgStr;
  }

  // Handle absolute paths (starts with /)
  if (imgStr.startsWith('/')) {
    // If it's already in the correct format, use as is
    if (imgStr.startsWith('/images/') || imgStr.startsWith('/uploads/')) {
      return `${API_URL}${imgStr}`;
    }
    // Otherwise prepend /images
    return `${API_URL}/images${imgStr}`;
  }

  // Handle relative paths
  // If it's a filename without path, prepend /images/
  if (!imgStr.includes('/')) {
    return `${API_URL}/images/${imgStr}`;
  }

  // For any other relative paths, prepend the API_URL
  return `${API_URL}/${imgStr}`;
}
