import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import {
    GOOGLE_GEOCODING_API_KEY,
    PLACE_DETAILS_URL,
    PLACES_AUTOCOMPLETE_URL,
    SEARCH_DEBOUNCE_MS,
} from '@/constants/locationConstants';
import { useLocation } from '@/context/LocationContext';
import {
    getCurrentCoordinates,
    requestLocationPermission,
    reverseGeocode,
    type Coordinates,
    type LocationAddress,
} from '@/services/locationService';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

// ─── Icons ────────────────────────────────────────────────────────────────────

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 5l-7 7 7 7" stroke={Brand.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={Brand.textMuted} strokeWidth={2} />
      <Path d="M16.5 16.5L22 22" stroke={Brand.textMuted} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function PinIcon({ color = Brand.primary }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={Brand.textMuted} strokeWidth={1.8} />
      <Path d="M12 7v5l3 3" stroke={Brand.textMuted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: { main_text: string; secondary_text: string };
}

// ─── Google Places helpers ────────────────────────────────────────────────────

async function fetchPredictions(query: string): Promise<PlacePrediction[]> {
  if (!GOOGLE_GEOCODING_API_KEY || query.length < 2) return [];
  try {
    const url = `${PLACES_AUTOCOMPLETE_URL}?input=${encodeURIComponent(query)}&key=${GOOGLE_GEOCODING_API_KEY}&components=country:in&language=en`;
    const res = await fetch(url);
    const json = await res.json();
    return json.status === 'OK' ? json.predictions : [];
  } catch { return []; }
}

async function fetchPlaceDetails(placeId: string): Promise<{ coords: Coordinates; address: LocationAddress } | null> {
  if (!GOOGLE_GEOCODING_API_KEY) return null;
  try {
    const url = `${PLACE_DETAILS_URL}?place_id=${placeId}&fields=geometry,formatted_address,address_components,name&key=${GOOGLE_GEOCODING_API_KEY}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.status !== 'OK') return null;
    const r = json.result;
    const coords: Coordinates = { latitude: r.geometry.location.lat, longitude: r.geometry.location.lng };
    const comp: Record<string, string> = {};
    for (const c of r.address_components ?? []) for (const t of c.types) comp[t] = c.long_name;
    const area = comp.sublocality_level_1 ?? comp.sublocality ?? comp.neighborhood ?? r.name ?? '';
    const city = comp.locality ?? comp.administrative_area_level_2 ?? '';
    const shortLabel = [area, city].filter(Boolean).join(', ') || r.name || 'Selected Location';
    const address: LocationAddress = {
      formatted: r.formatted_address ?? shortLabel,
      shortLabel,
      street: [comp.street_number, comp.route].filter(Boolean).join(' '),
      area, city,
      state: comp.administrative_area_level_1 ?? '',
      country: comp.country ?? '',
      postalCode: comp.postal_code ?? '',
      landmark: r.name ?? '',
    };
    return { coords, address };
  } catch { return null; }
}

// ─── Component ────────────────────────────────────────────────────────────────

export const LocationSearchModal = memo(function LocationSearchModal() {
  const {
    showSearchModal,
    recentLocations,
    closeSearchModal,
    setLocationFromSearch,
    permissionStatus,
    coordinates,
  } = useLocation();

  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSelectingPlace, setIsSelectingPlace] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);
  // Track if this modal instance is still mounted/visible to avoid setState after unmount
  const activeRef = useRef(false);

  useEffect(() => {
    if (showSearchModal) {
      activeRef.current = true;
      setGpsError(null);
      inputRef.current?.focus();
    } else {
      activeRef.current = false;
      setQuery('');
      setPredictions([]);
      setGpsLoading(false);
      setGpsError(null);
    }
  }, [showSearchModal]);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) { setPredictions([]); return; }
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await fetchPredictions(text);
      if (activeRef.current) {
        setPredictions(results);
        setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  const handleSelectPrediction = useCallback(async (item: PlacePrediction) => {
    Keyboard.dismiss();
    setIsSelectingPlace(true);
    const details = await fetchPlaceDetails(item.place_id);
    if (!activeRef.current) return;
    setIsSelectingPlace(false);
    if (details) {
      // setLocationFromSearch dispatches LOCATION_CONFIRMED immediately — modal closes at once
      await setLocationFromSearch(details.coords, details.address);
    }
  }, [setLocationFromSearch]);

  const handleUseCurrentLocation = useCallback(async () => {
    Keyboard.dismiss();
    setGpsError(null);
    setGpsLoading(true);

    try {
      // Always re-check permission status fresh — don't rely on stale context value
      let perm = permissionStatus;
      if (perm !== 'granted') {
        perm = await requestLocationPermission();
      }

      if (!activeRef.current) return;

      if (perm === 'blocked') {
        setGpsError('blocked');
        setGpsLoading(false);
        return;
      }
      if (perm !== 'granted') {
        setGpsError('denied');
        setGpsLoading(false);
        return;
      }

      const coords = await getCurrentCoordinates();
      if (!activeRef.current) return;

      const address = await reverseGeocode(coords);
      if (!activeRef.current) return;

      // This dispatches LOCATION_CONFIRMED synchronously — modal closes immediately
      await setLocationFromSearch(coords, address);

    } catch (e) {
      if (activeRef.current) {
        setGpsError('failed');
        setGpsLoading(false);
      }
    }
  }, [permissionStatus, setLocationFromSearch]);

  const handleSelectRecent = useCallback(async (item: typeof recentLocations[number]) => {
    await setLocationFromSearch(item.coordinates, item.address);
  }, [setLocationFromSearch]);

  const showPredictions = query.trim().length > 0;
  const showRecents = !query.trim() && recentLocations.length > 0;

  return (
    <Modal
      visible={showSearchModal}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={coordinates ? closeSearchModal : undefined}>
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>

        {/* Header */}
        <View style={styles.header}>
          {coordinates ? (
            <Pressable style={styles.backBtn} onPress={closeSearchModal} hitSlop={12}>
              <BackIcon />
            </Pressable>
          ) : (
            <View style={styles.backBtn} />
          )}
          <Text style={styles.headerTitle}>Select Location</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search input */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <SearchIcon />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search city, area or locality..."
              placeholderTextColor={Brand.textMuted}
              value={query}
              onChangeText={handleQueryChange}
              returnKeyType="search"
              autoCorrect={false}
            />
            {isSearching && <ActivityIndicator size="small" color={Brand.primary} />}
            {query.length > 0 && !isSearching && (
              <Pressable onPress={() => { setQuery(''); setPredictions([]); }} hitSlop={8}>
                <Text style={styles.clearBtn}>✕</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Use current location */}
        <Pressable
          style={styles.currentLocationBtn}
          onPress={handleUseCurrentLocation}
          disabled={gpsLoading}>
          <View style={styles.currentLocationIcon}>
            {gpsLoading
              ? <ActivityIndicator size="small" color={Brand.primary} />
              : <PinIcon color={Brand.primary} />}
          </View>
          <View style={styles.currentLocationTexts}>
            <Text style={styles.currentLocationTitle}>
              {gpsLoading ? 'Fetching location...' : 'Use My Current Location'}
            </Text>
            <Text style={styles.currentLocationSub}>
              {gpsError === 'blocked'
                ? 'Permission denied — enable in Settings'
                : gpsError === 'denied'
                ? 'Permission denied — try again'
                : gpsError === 'failed'
                ? 'Could not get location — tap to retry'
                : 'Detect via GPS'}
            </Text>
          </View>
        </Pressable>

        <View style={styles.divider} />

        {/* Predictions */}
        {showPredictions && (
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              !isSearching ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>No results found</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable style={styles.resultRow} onPress={() => handleSelectPrediction(item)}>
                <View style={styles.resultIcon}><PinIcon color={Brand.textMuted} /></View>
                <View style={styles.resultTexts}>
                  <Text style={styles.resultMain} numberOfLines={1}>{item.structured_formatting.main_text}</Text>
                  <Text style={styles.resultSub} numberOfLines={1}>{item.structured_formatting.secondary_text}</Text>
                </View>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.rowDivider} />}
          />
        )}

        {/* Recents */}
        {showRecents && (
          <>
            <Text style={styles.sectionLabel}>Recent Locations</Text>
            <FlatList
              data={recentLocations}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable style={styles.resultRow} onPress={() => handleSelectRecent(item)}>
                  <View style={styles.resultIcon}><ClockIcon /></View>
                  <View style={styles.resultTexts}>
                    <Text style={styles.resultMain} numberOfLines={1}>{item.address.area || item.address.city || 'Location'}</Text>
                    <Text style={styles.resultSub} numberOfLines={1}>{item.address.formatted}</Text>
                  </View>
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.rowDivider} />}
            />
          </>
        )}

        {/* Empty hint */}
        {!showRecents && !showPredictions && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyHint}>Start typing to search for a location</Text>
          </View>
        )}

        {/* Place-selecting overlay */}
        {isSelectingPlace && (
          <View style={styles.selectingOverlay}>
            <ActivityIndicator color={Brand.primary} size="large" />
            <Text style={styles.selectingText}>Fetching location details...</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
    gap: Spacing.md,
    backgroundColor: Brand.white,
    ...Platform.select({
      ios: { shadowColor: '#0A1628', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  headerSpacer: { width: 36 },
  backBtn: {
    width: 36, height: 36,
    borderRadius: Radius.full,
    backgroundColor: Brand.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, ...Typography.h3, color: Brand.textPrimary, textAlign: 'center' },
  searchWrap: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Brand.border,
    paddingHorizontal: Spacing.base, paddingVertical: 10,
    gap: Spacing.sm,
  },
  searchInput: { flex: 1, ...Typography.body, color: Brand.textPrimary, padding: 0 },
  clearBtn: { fontSize: 14, color: Brand.textMuted, fontWeight: '600' },
  currentLocationBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  currentLocationIcon: {
    width: 40, height: 40, borderRadius: Radius.full,
    backgroundColor: Brand.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  currentLocationTexts: { flex: 1, gap: 2 },
  currentLocationTitle: { ...Typography.smallMedium, color: Brand.primary, fontWeight: '700' },
  currentLocationSub: { ...Typography.caption, color: Brand.textMuted },
  divider: { height: 8, backgroundColor: Brand.offWhite },
  sectionLabel: {
    ...Typography.label, color: Brand.textMuted,
    paddingHorizontal: Spacing.base, paddingTop: Spacing.base,
    paddingBottom: Spacing.sm, textTransform: 'uppercase',
  },
  resultRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, gap: Spacing.md,
  },
  resultIcon: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: Brand.surface, alignItems: 'center', justifyContent: 'center',
  },
  resultTexts: { flex: 1, gap: 2 },
  resultMain: { ...Typography.smallMedium, color: Brand.textPrimary, fontWeight: '600' },
  resultSub: { ...Typography.caption, color: Brand.textMuted },
  rowDivider: {
    height: 1, backgroundColor: Brand.borderLight,
    marginLeft: Spacing.base + 36 + Spacing.md,
  },
  selectingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center', gap: Spacing.md, zIndex: 10,
  },
  selectingText: { ...Typography.smallMedium, color: Brand.textSecondary },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { ...Typography.body, color: Brand.textMuted },
  emptyHint: { ...Typography.small, color: Brand.textMuted, textAlign: 'center' },
});
