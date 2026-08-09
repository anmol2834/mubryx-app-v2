export const LOCATION_CHANGE_THRESHOLD_METERS = 800;
export const GPS_TIMEOUT_MS = 10000;
export const GPS_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes — last-known cache window

export const STORAGE_KEYS = {
  SAVED_LOCATION: 'mubryx_saved_location',
  RECENT_LOCATIONS: 'mubryx_recent_locations',
  LOCATION_PERMISSION_ASKED: 'mubryx_location_permission_asked',
} as const;

export const MAX_RECENT_LOCATIONS = 5;

export const GOOGLE_GEOCODING_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY ?? '';
export const GEOCODING_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
export const PLACES_AUTOCOMPLETE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
export const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
export const SEARCH_DEBOUNCE_MS = 350;
