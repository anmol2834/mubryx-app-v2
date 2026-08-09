import {
    checkLocationPermission,
    getCurrentCoordinates,
    isSignificantLocationChange,
    loadPersistedLocation,
    loadRecentLocations,
    persistLocation,
    reverseGeocode,
    saveRecentLocation,
    type Coordinates,
    type LocationAddress,
    type PermissionStatus,
    type RecentLocation,
} from '@/services/locationService';
import { useAuthStore } from '@/store/authStore';
import React, {
    createContext,
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
} from 'react';

// ─── State ────────────────────────────────────────────────────────────────────

interface LocationState {
  permissionStatus: PermissionStatus;
  coordinates: Coordinates | null;
  address: LocationAddress | null;
  recentLocations: RecentLocation[];
  isFetchingGPS: boolean;
  isInitializing: boolean;
  showSearchModal: boolean;
  showMovedBanner: boolean;
  pendingCoordinates: Coordinates | null;
  pendingAddress: LocationAddress | null;
}

type LocationAction =
  | { type: 'BOOT_DONE'; permission: PermissionStatus; coordinates: Coordinates | null; address: LocationAddress | null; recents: RecentLocation[]; showSearchModal: boolean }
  | { type: 'GPS_SILENT_UPDATE'; coordinates: Coordinates; address: LocationAddress; recents: RecentLocation[] }
  | { type: 'GPS_MOVED'; coordinates: Coordinates; address: LocationAddress }
  | { type: 'OPEN_SEARCH_MODAL' }
  | { type: 'CLOSE_SEARCH_MODAL' }
  | { type: 'LOCATION_CONFIRMED'; coordinates: Coordinates; address: LocationAddress }
  | { type: 'RECENTS_UPDATED'; recents: RecentLocation[] }
  | { type: 'ACCEPT_MOVED'; coordinates: Coordinates; address: LocationAddress; recents: RecentLocation[] }
  | { type: 'DISMISS_MOVED' }
  | { type: 'FETCHING_GPS' }
  | { type: 'CLEAR_LOCATION' };

const INITIAL: LocationState = {
  permissionStatus: 'undetermined',
  coordinates: null,
  address: null,
  recentLocations: [],
  isFetchingGPS: false,
  isInitializing: true,
  showSearchModal: false,
  showMovedBanner: false,
  pendingCoordinates: null,
  pendingAddress: null,
};

function reducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'BOOT_DONE':
      return {
        ...state,
        isInitializing: false,
        permissionStatus: action.permission,
        coordinates: action.coordinates,
        address: action.address,
        recentLocations: action.recents,
        showSearchModal: action.showSearchModal,
      };
    case 'FETCHING_GPS':
      return { ...state, isFetchingGPS: true };
    case 'GPS_SILENT_UPDATE':
      return {
        ...state,
        isFetchingGPS: false,
        coordinates: action.coordinates,
        address: action.address,
        recentLocations: action.recents,
      };
    case 'GPS_MOVED':
      return {
        ...state,
        isFetchingGPS: false,
        showMovedBanner: true,
        pendingCoordinates: action.coordinates,
        pendingAddress: action.address,
      };
    case 'OPEN_SEARCH_MODAL':
      return { ...state, showSearchModal: true };
    case 'CLOSE_SEARCH_MODAL':
      return { ...state, showSearchModal: false };
    // Immediately update coordinates + close modal — storage happens in background
    case 'LOCATION_CONFIRMED':
      return {
        ...state,
        coordinates: action.coordinates,
        address: action.address,
        showSearchModal: false,
        showMovedBanner: false,
        pendingCoordinates: null,
        pendingAddress: null,
        isFetchingGPS: false,
      };
    // Recents arrive slightly after — update without touching anything else
    case 'RECENTS_UPDATED':
      return { ...state, recentLocations: action.recents };
    case 'ACCEPT_MOVED':
      return {
        ...state,
        coordinates: action.coordinates,
        address: action.address,
        recentLocations: action.recents,
        showMovedBanner: false,
        pendingCoordinates: null,
        pendingAddress: null,
      };
    case 'DISMISS_MOVED':
      return { ...state, showMovedBanner: false, pendingCoordinates: null, pendingAddress: null };
    case 'CLEAR_LOCATION':
      return { ...state, coordinates: null, address: null, recentLocations: [] };
    default:
      return state;
  }
}

// ─── Context value ────────────────────────────────────────────────────────────

interface LocationContextValue extends LocationState {
  openSearchModal: () => void;
  closeSearchModal: () => void;
  setLocationFromSearch: (coords: Coordinates, address: LocationAddress) => Promise<void>;
  dismissMovedBanner: () => void;
  acceptMovedLocation: () => Promise<void>;
  openLocationSelector: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const LocationProvider = memo(function LocationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const mountedRef = useRef(true);
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);

  useEffect(() => {
    // Ensure mountedRef is true on mount and false on unmount
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    // If the user logs out, clear the location session data in memory.
    if (!isLoading && !user && !state.isInitializing) {
      dispatch({ type: 'CLEAR_LOCATION' });
    }
  }, [user, isLoading, state.isInitializing]);

  // ── Boot sequence ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [recents, permission, persisted] = await Promise.all([
        loadRecentLocations(),
        checkLocationPermission(),
        loadPersistedLocation(),
      ]);

      if (!mountedRef.current) return;

      // Show modal immediately if no saved location
      dispatch({
        type: 'BOOT_DONE',
        permission,
        coordinates: persisted?.coordinates ?? null,
        address: persisted?.address ?? null,
        recents,
        showSearchModal: false,
      });

      // Silent background GPS — only when permission already granted
      if (permission !== 'granted') return;

      try {
        dispatch({ type: 'FETCHING_GPS' });
        const coords = await getCurrentCoordinates();
        if (!mountedRef.current) return;

        const geo = await reverseGeocode(coords);
        if (!mountedRef.current) return;

        if (persisted && isSignificantLocationChange(persisted.coordinates, coords)) {
          dispatch({ type: 'GPS_MOVED', coordinates: coords, address: geo });
        } else {
          // Same area — silently update in background, no UI interruption
          await persistLocation(coords, geo);
          await saveRecentLocation(coords, geo);
          const updatedRecents = await loadRecentLocations();
          if (!mountedRef.current) return;
          dispatch({ type: 'GPS_SILENT_UPDATE', coordinates: coords, address: geo, recents: updatedRecents });
        }
      } catch {
        // GPS failed silently — keep persisted location, do NOT touch modal state
        if (mountedRef.current) dispatch({ type: 'FETCHING_GPS' }); // reset isFetchingGPS
      }
    })();
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const openSearchModal = useCallback(() => {
    dispatch({ type: 'OPEN_SEARCH_MODAL' });
  }, []);

  const closeSearchModal = useCallback(() => {
    dispatch({ type: 'CLOSE_SEARCH_MODAL' });
  }, []);

  const setLocationFromSearch = useCallback(async (coords: Coordinates, address: LocationAddress) => {
    // *** Dispatch IMMEDIATELY — modal closes right away, no waiting for storage ***
    dispatch({ type: 'LOCATION_CONFIRMED', coordinates: coords, address });

    // Storage writes happen in background after UI has already updated
    try {
      await persistLocation(coords, address);
      await saveRecentLocation(coords, address);
      const recents = await loadRecentLocations();
      if (mountedRef.current) {
        dispatch({ type: 'RECENTS_UPDATED', recents });
      }
    } catch {
      // Storage failure is non-fatal — location is already set in state
    }
  }, []);

  const dismissMovedBanner = useCallback(() => {
    dispatch({ type: 'DISMISS_MOVED' });
  }, []);

  const acceptMovedLocation = useCallback(async () => {
    if (!state.pendingCoordinates || !state.pendingAddress) return;
    const { pendingCoordinates: coords, pendingAddress: address } = state;
    // Dismiss banner immediately
    dispatch({ type: 'LOCATION_CONFIRMED', coordinates: coords, address });
    try {
      await persistLocation(coords, address);
      await saveRecentLocation(coords, address);
      const recents = await loadRecentLocations();
      if (mountedRef.current) dispatch({ type: 'RECENTS_UPDATED', recents });
    } catch {}
  }, [state.pendingCoordinates, state.pendingAddress]);

  const openLocationSelector = useCallback(() => {
    dispatch({ type: 'OPEN_SEARCH_MODAL' });
  }, []);

  const value = useMemo<LocationContextValue>(() => ({
    ...state,
    openSearchModal,
    closeSearchModal,
    setLocationFromSearch,
    dismissMovedBanner,
    acceptMovedLocation,
    openLocationSelector,
  }), [
    state,
    openSearchModal,
    closeSearchModal,
    setLocationFromSearch,
    dismissMovedBanner,
    acceptMovedLocation,
    openLocationSelector,
  ]);

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
});

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within <LocationProvider>');
  return ctx;
}
