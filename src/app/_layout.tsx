import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LocationSearchModal } from '@/components/location/LocationSearchModal';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { useAuthStore } from '@/store/authStore';
import { LocationProvider } from '@/context/LocationContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/queryClient';
import '@/global.css';
import { Redirect, Stack, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { BackHandler, LogBox, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

LogBox.ignoreLogs([
  'Cannot connect to Expo CLI',
]);

SplashScreen.preventAutoHideAsync();

function GlobalBackHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/' || pathname === '/login' || pathname === '/otp') return;

    const onBackPress = () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [pathname, router]);

  return null;
}

function AuthenticatedLocationModal() {
  const user = useAuthStore(s => s.user);
  if (!user) return null;
  return <LocationSearchModal />;
}

export default function RootLayout() {
  const hydrateSession = useAuthStore(s => s.hydrateSession);
  
  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <GluestackUIProvider mode="light">
              <LocationProvider>
                <GlobalBackHandler />
                <AnimatedSplashOverlay />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="login" />
                  <Stack.Screen name="otp" />
                  <Stack.Screen name="index" />
                </Stack>
                <AuthenticatedLocationModal />
              </LocationProvider>
          </GluestackUIProvider>
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
