const API_BASE = process.env.EXPO_PUBLIC_API_URL ? process.env.EXPO_PUBLIC_API_URL.replace('/v1', '') : 'http://10.0.2.2:3000';

const WEBP_FALLBACKS: Record<string, string> = {
  'ac-service.webp': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop',
  'fridge-service.webp': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=800&auto=format&fit=crop',
  'washing-machine-service.webp': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=800&auto=format&fit=crop',
  'microwave-service.webp': 'https://images.unsplash.com/photo-1585659722983-38ca84b8f36c?q=80&w=800&auto=format&fit=crop',
  'water-purifier-service.webp': 'https://images.unsplash.com/photo-1543330606-4076fb4bb991?q=80&w=800&auto=format&fit=crop',
  'tv-service.webp': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop',
};

/**
 * Format image path to full URL safely. Handles relative asset paths, absolute URLs, and fallbacks.
 */
export function getImageUrl(imagePath?: string | null, fallback = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop'): string {
  if (!imagePath || imagePath.trim() === '') {
    return fallback;
  }

  const trimmed = imagePath.trim();

  // If already an absolute HTTP/HTTPS URL or data URI
  if (/^(http|https|data):/i.test(trimmed)) {
    return trimmed;
  }

  // Handle missing .webp files by mapping them to Unsplash
  const filename = trimmed.replace(/^\//, '');
  if (WEBP_FALLBACKS[filename]) {
    return WEBP_FALLBACKS[filename];
  }

  // Handle leading slashes for relative backend asset paths
  const relativePath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${API_BASE}${relativePath}`;
}
