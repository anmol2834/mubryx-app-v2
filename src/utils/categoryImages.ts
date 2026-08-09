import { ImageSourcePropType } from 'react-native';

const LOCAL_WEBP_MAP: Record<string, ImageSourcePropType> = {
  'ac-service.webp': require('@/assets/images/ac-service.webp'),
  'fridge-service.webp': require('@/assets/images/fridge-service.webp'),
  'washing-machine-service.webp': require('@/assets/images/washing-machine-service.webp'),
  'microwave-service.webp': require('@/assets/images/microwave-service.webp'),
  'water-purifier-service.webp': require('@/assets/images/water-purifier-service.webp'),
  'tv-service.webp': require('@/assets/images/tv-service.webp'),
  'geyser-service.webp': require('@/assets/images/geyser-service.webp'),
  'cooler-service.webp': require('@/assets/images/cooler-service.webp'),
  'Electrician-Services.webp': require('@/assets/images/Electrician-Services.webp'),
  'Plumbing-Services.webp': require('@/assets/images/Plumbing-Services.webp'),
  'Dispenser-Service.webp': require('@/assets/images/Dispenser-Service.webp'),
};

const DEFAULT_PLACEHOLDER = require('@/assets/images/service-placeholder.png');

/**
 * Safely resolves a category or service image path into a React Native Image source prop.
 * Handles local bundled WebP files, category slugs, HTTP(S) URLs, and fallback assets.
 */
export function getCategoryAssetSource(
  imagePath?: string | null,
  slug?: string | null,
  name?: string | null
): ImageSourcePropType {
  // 1. Direct match on local WebP asset file name
  if (imagePath) {
    const filename = imagePath.trim().replace(/^\//, '');
    if (LOCAL_WEBP_MAP[filename]) {
      return LOCAL_WEBP_MAP[filename];
    }
    if (/^(http|https|data):/i.test(imagePath.trim())) {
      return { uri: imagePath.trim() };
    }
  }

  // 2. Keyword fallback by slug or category name
  const term = (slug || name || '').toLowerCase();
  if (term.includes('ac') || term.includes('air-conditioner')) {
    return require('@/assets/images/ac-service.webp');
  }
  if (term.includes('fridge') || term.includes('refrigerator')) {
    return require('@/assets/images/fridge-service.webp');
  }
  if (term.includes('washing') || term.includes('washer')) {
    return require('@/assets/images/washing-machine-service.webp');
  }
  if (term.includes('microwave') || term.includes('oven')) {
    return require('@/assets/images/microwave-service.webp');
  }
  if (term.includes('water') || term.includes('purifier') || term.includes('ro')) {
    return require('@/assets/images/water-purifier-service.webp');
  }
  if (term.includes('tv') || term.includes('television')) {
    return require('@/assets/images/tv-service.webp');
  }
  if (term.includes('geyser') || term.includes('heater')) {
    return require('@/assets/images/geyser-service.webp');
  }
  if (term.includes('cooler')) {
    return require('@/assets/images/cooler-service.webp');
  }
  if (term.includes('electric') || term.includes('wire')) {
    return require('@/assets/images/Electrician-Services.webp');
  }
  if (term.includes('plumb') || term.includes('pipe') || term.includes('tap')) {
    return require('@/assets/images/Plumbing-Services.webp');
  }

  return DEFAULT_PLACEHOLDER;
}
