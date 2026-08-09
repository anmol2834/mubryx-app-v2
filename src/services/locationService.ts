import * as ExpoLocation from 'expo-location';
import { Storage } from '@/services/storage';
import {
  GEOCODING_BASE_URL,
  GOOGLE_GEOCODING_API_KEY,
  GPS_MAX_AGE_MS,
  GPS_TIMEOUT_MS,
  LOCATION_CHANGE_THRESHOLD_METERS,
  MAX_RECENT_LOCATIONS,
  STORAGE_KEYS,
} from '@/constants/locationConstants';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationAddress {
  formatted: string;
  shortLabel: string;
  street: string;
  area: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  landmark: string;
}

export interface RecentLocation {
  id: string;
  coordinates: Coordinates;
  address: LocationAddress;
  usedAt: number;
}

export interface PersistedLocationData {
  coordinates: Coordinates;
  address: LocationAddress;
  savedAt: number;
}

export type PermissionStatus = 'undetermined' | 'granted' | 'denied' | 'blocked';

// ─── Permission ───────────────────────────────────────────────────────────────

export async function checkLocationPermission(): Promise<PermissionStatus> {
  const { status } = await ExpoLocation.getForegroundPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export async function requestLocationPermission(): Promise<PermissionStatus> {
  const { status, canAskAgain } = await ExpoLocation.requestForegroundPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (!canAskAgain) return 'blocked';
  return 'denied';
}

// ─── GPS ──────────────────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export async function getCurrentCoordinates(): Promise<Coordinates> {
  // 1. Try last-known position — instant, no GPS radio needed.
  //    Use a generous 5-minute window; a 5-min-old fix is accurate enough for service selection.
  const last = await ExpoLocation.getLastKnownPositionAsync({
    maxAge: GPS_MAX_AGE_MS,
    requiredAccuracy: 200,
  });
  if (last) {
    return { latitude: last.coords.latitude, longitude: last.coords.longitude };
  }

  // 2. Fresh fix with hard timeout so it never hangs forever.
  const location = await withTimeout(
    ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced }),
    GPS_TIMEOUT_MS,
    'GPS'
  );
  return { latitude: location.coords.latitude, longitude: location.coords.longitude };
}

// ─── Reverse Geocode ──────────────────────────────────────────────────────────

export async function reverseGeocode(coords: Coordinates): Promise<LocationAddress> {
  if (GOOGLE_GEOCODING_API_KEY) {
    try {
      // 8-second timeout on geocode network call
      return await withTimeout(reverseGeocodeWithGoogle(coords), 8000, 'Geocode');
    } catch {
      // fall through to Expo fallback
    }
  }
  try {
    return await withTimeout(reverseGeocodeWithExpo(coords), 8000, 'ExpoGeocode');
  } catch {
    return buildFallbackAddress(coords);
  }
}

async function reverseGeocodeWithExpo(coords: Coordinates): Promise<LocationAddress> {
  const results = await ExpoLocation.reverseGeocodeAsync({
    latitude: coords.latitude,
    longitude: coords.longitude,
  });
  if (!results?.length) return buildFallbackAddress(coords);
  const r = results[0];
  const street = [r.streetNumber, r.street].filter(Boolean).join(' ');
  const area = r.district ?? r.subregion ?? r.name ?? '';
  const city = r.city ?? r.region ?? '';
  const state = r.region ?? '';
  const country = r.country ?? '';
  const postalCode = r.postalCode ?? '';
  const shortLabel = [area, city].filter(Boolean).join(', ') || 'Your Location';
  const formatted = [street, area, city, state, postalCode].filter(Boolean).join(', ') || shortLabel;
  return { formatted, shortLabel, street, area, city, state, country, postalCode, landmark: '' };
}

async function reverseGeocodeWithGoogle(coords: Coordinates): Promise<LocationAddress> {
  const url = `${GEOCODING_BASE_URL}?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_GEOCODING_API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.status !== 'OK' || !json.results?.length) throw new Error('Google geocoding failed');
  const result = json.results[0];
  const comp: Record<string, string> = {};
  for (const c of result.address_components) {
    for (const t of c.types) comp[t] = c.long_name;
  }
  const street = [comp.street_number, comp.route].filter(Boolean).join(' ');
  const area = comp.sublocality_level_1 ?? comp.sublocality ?? comp.neighborhood ?? '';
  const city = comp.locality ?? comp.administrative_area_level_2 ?? '';
  const state = comp.administrative_area_level_1 ?? '';
  const country = comp.country ?? '';
  const postalCode = comp.postal_code ?? '';
  const landmark = comp.point_of_interest ?? comp.establishment ?? '';
  const shortLabel = [area, city].filter(Boolean).join(', ') || 'Your Location';
  const formatted = result.formatted_address ?? [street, area, city, state, postalCode].filter(Boolean).join(', ');
  return { formatted, shortLabel, street, area, city, state, country, postalCode, landmark };
}

function buildFallbackAddress(coords: Coordinates): LocationAddress {
  return {
    formatted: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
    shortLabel: 'Your Location',
    street: '', area: '', city: '', state: '', country: '', postalCode: '', landmark: '',
  };
}

// ─── Distance ─────────────────────────────────────────────────────────────────

export function getDistanceMeters(a: Coordinates, b: Coordinates): number {
  const R = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function toRad(deg: number) { return (deg * Math.PI) / 180; }

export function isSignificantLocationChange(a: Coordinates, b: Coordinates): boolean {
  return getDistanceMeters(a, b) > LOCATION_CHANGE_THRESHOLD_METERS;
}

// ─── Persistence ──────────────────────────────────────────────────────────────

export async function persistLocation(coords: Coordinates, address: LocationAddress): Promise<void> {
  await Storage.setItem(
    STORAGE_KEYS.SAVED_LOCATION,
    JSON.stringify({ coordinates: coords, address, savedAt: Date.now() })
  );
}

export async function loadPersistedLocation(): Promise<PersistedLocationData | null> {
  try {
    const raw = await Storage.getItem(STORAGE_KEYS.SAVED_LOCATION);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function loadRecentLocations(): Promise<RecentLocation[]> {
  try {
    const raw = await Storage.getItem(STORAGE_KEYS.RECENT_LOCATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function saveRecentLocation(coords: Coordinates, address: LocationAddress): Promise<void> {
  const recents = await loadRecentLocations();
  const filtered = recents.filter((r) => getDistanceMeters(r.coordinates, coords) > 200);
  const updated = [
    { id: `${Date.now()}`, coordinates: coords, address, usedAt: Date.now() },
    ...filtered,
  ].slice(0, MAX_RECENT_LOCATIONS);
  await Storage.setItem(STORAGE_KEYS.RECENT_LOCATIONS, JSON.stringify(updated));
}

export async function hasAskedPermissionBefore(): Promise<boolean> {
  const val = await Storage.getItem(STORAGE_KEYS.LOCATION_PERMISSION_ASKED);
  return val === 'true';
}

export async function markPermissionAsked(): Promise<void> {
  await Storage.setItem(STORAGE_KEYS.LOCATION_PERMISSION_ASKED, 'true');
}
