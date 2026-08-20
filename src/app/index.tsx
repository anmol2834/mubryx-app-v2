import { useAuthStore } from '@/store/authStore';
import { useCategoriesQuery } from '@/hooks/queries/useCategoriesQuery';
import { useCartQuery } from '@/hooks/queries/useCartQuery';
import { Redirect } from 'expo-router';
import { memo, useCallback, useEffect, useState } from 'react';
import {
    BackHandler,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';

import { BrowseAppliance } from '@/components/home/BrowseAppliance';
import { HomeHeader } from '@/components/home/Header';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { SpecialOffers } from '@/components/home/Offers';
import { PopularProblems } from '@/components/home/PopularProblems';
import { QuickServices } from '@/components/home/QuickServices';
import { LocationMovedBanner } from '@/components/location/LocationMovedBanner';
import { BottomNavigation, TabName } from '@/components/navigation/BottomNavigation';
import { Brand } from '@/constants/brand';
import { NotificationsScreen } from '@/screens/Notifications';
import { ProfileScreen } from '@/screens/Profile';
import { ReviewsScreen } from '@/screens/Reviews';
import { BookingHistoryScreen } from '@/screens/BookingHistory';
import { TrackScreen } from '@/screens/Track';

const SectionDivider = memo(function SectionDivider() {
  return <View style={styles.divider} />;
});

const FooterPadding = memo(function FooterPadding() {
  return <View style={styles.footerPad} />;
});

export default function HomeScreen() {
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [notifVisible, setNotifVisible] = useState(false);

  const { isRefetching: isCatRefetching, refetch: refetchCategories } = useCategoriesQuery();
  const { isRefetching: isCartRefetching, refetch: refetchCart } = useCartQuery();
  const isRefreshing = isCatRefetching || isCartRefetching;

  useEffect(() => {
    const onBackPress = () => {
      if (notifVisible) {
        setNotifVisible(false);
        return true;
      }
      if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [activeTab, notifVisible]);

  const handleHomeRefresh = useCallback(() => {
    refetchCategories();
    refetchCart();
  }, [refetchCategories, refetchCart]);

  const [targetTrackBookingId, setTargetTrackBookingId] = useState<string | null>(null);

  const handleTabChange = useCallback((tab: TabName) => {
    setActiveTab(tab);
    setNotifVisible(false);
  }, []);

  const handleNavigateToTrack = useCallback((bookingId?: string) => {
    if (bookingId) {
      setTargetTrackBookingId(bookingId);
    }
    setActiveTab('track');
    setNotifVisible(false);
  }, []);

  const handleTrackBack = useCallback(() => {
    setTargetTrackBookingId(null);
    setActiveTab('home');
  }, []);

  const handleBookService = useCallback(() => {
    setActiveTab('home');
  }, []);

  const handleNotifOpen = useCallback(() => {
    setNotifVisible(true);
  }, []);

  const handleNotifBack = useCallback(() => {
    setNotifVisible(false);
  }, []);

  const handleNotifReview = useCallback(() => {
    setNotifVisible(false);
    setActiveTab('review');
  }, []);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const homeVisible = activeTab === 'home' && !notifVisible;
  const profileVisible = activeTab === 'profile' && !notifVisible;
  const trackVisible = activeTab === 'track' && !notifVisible;
  const reviewVisible = activeTab === 'review' && !notifVisible;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Brand.white}
        translucent={false}
      />

      {/* Home tab — kept mounted, hidden when inactive */}
      <View style={[styles.tabScreen, !homeVisible && styles.hidden]}>
        <HomeHeader onNotifPress={handleNotifOpen} />
        <View style={styles.contentArea}>
          <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleHomeRefresh}
              colors={[Brand.primary]}
              tintColor={Brand.primary}
            />
          }>
          <HeroCarousel />
          <SectionDivider />
          <QuickServices />
          <SectionDivider />
          <BrowseAppliance />
          <SectionDivider />
          <PopularProblems />
          {/* <SectionDivider /> */}
          {/* <SpecialOffers /> */}
          <FooterPadding />
        </ScrollView>
        <LocationMovedBanner />
        </View>
      </View>

      {/* History tab */}
      <View style={[styles.tabScreen, activeTab !== 'history' && styles.hidden]}>
        <BookingHistoryScreen />
      </View>

      {/* Profile tab */}
      <View style={[styles.tabScreen, !profileVisible && styles.hidden]}>
        <ProfileScreen onNavigateToTrack={handleNavigateToTrack} />
      </View>

      {/* Track tab */}
      <View style={[styles.tabScreen, !trackVisible && styles.hidden]}>
        <TrackScreen
          isActive={trackVisible}
          targetBookingId={targetTrackBookingId}
          onBack={handleTrackBack}
          onBookService={handleBookService}
        />
      </View>

      {/* Reviews tab */}
      <View style={[styles.tabScreen, !reviewVisible && styles.hidden]}>
        <ReviewsScreen isActive={reviewVisible} />
      </View>

      {/* Notifications overlay — mounts on first open, hidden when not active */}
      <View style={[styles.tabScreen, styles.notifOverlay, !notifVisible && styles.hidden]}>
        <NotificationsScreen
          isActive={notifVisible}
          onBack={handleNotifBack}
          onNavigateToTrack={handleNavigateToTrack}
          onNavigateToReview={handleNotifReview}
        />
      </View>

      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.white,
  },
  // Each tab screen fills the full root; only one is visible at a time
  tabScreen: {
    flex: 1,
    backgroundColor: Brand.white,
  },
  // Hides a screen without unmounting it — instant tab switching, no remount cost
  hidden: {
    display: 'none',
  },
  contentArea: {
    flex: 1,
    position: 'relative',
  },
  scroll: {
    flex: 1,
    backgroundColor: Brand.white,
  },
  scrollContent: {
    backgroundColor: Brand.white,
  },
  divider: {
    height: 8,
    backgroundColor: Brand.offWhite,
  },
  footerPad: {
    height: 120,
    backgroundColor: Brand.white,
  },
  notifOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: Brand.white,
  },
});
