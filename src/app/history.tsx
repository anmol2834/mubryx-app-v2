import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  StatusBar, Pressable, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Brand, Typography, Spacing, Radius, Shadow } from '@/constants/brand';
import { BookingDetailModal, type BookingData } from '@/screens/BookingHistory/components/BookingDetailModal';

// ─── Mock history data ────────────────────────────────────────────────────────
const HISTORY = [
  {
    id: 'h1',
    service: 'AC Gas Refill Service',
    category: 'AC Service',
    date: '24 Jul 2025',
    time: '10:30 AM',
    status: 'Completed',
    statusColor: Brand.success,
    statusBg: Brand.successSoft,
    amount: '₹2,599',
    technician: 'Ravi Kumar',
    rating: 4.8,
    image: require('@/assets/images/ac-service.webp'),
  },
  {
    id: 'h2',
    service: 'Washing Machine Repair',
    category: 'Washing Machine',
    date: '18 Jul 2025',
    time: '02:00 PM',
    status: 'Completed',
    statusColor: Brand.success,
    statusBg: Brand.successSoft,
    amount: '₹499',
    technician: 'Suresh Singh',
    rating: 4.6,
    image: require('@/assets/images/washing-machine-service.webp'),
  },
  {
    id: 'h3',
    service: 'Fridge Not Cooling',
    category: 'Refrigerator',
    date: '10 Jul 2025',
    time: '11:00 AM',
    status: 'Cancelled',
    statusColor: Brand.error,
    statusBg: Brand.errorSoft,
    amount: '₹549',
    technician: '-',
    rating: 0,
    image: require('@/assets/images/fridge-service.webp'),
  },
  {
    id: 'h4',
    service: 'TV Screen Issue',
    category: 'Television',
    date: '02 Jul 2025',
    time: '04:30 PM',
    status: 'Completed',
    statusColor: Brand.success,
    statusBg: Brand.successSoft,
    amount: '₹499',
    technician: 'Anil Sharma',
    rating: 5.0,
    image: require('@/assets/images/tv-service.webp'),
  },
  {
    id: 'h5',
    service: 'Microwave Not Heating',
    category: 'Microwave',
    date: '25 Jun 2025',
    time: '09:00 AM',
    status: 'Completed',
    statusColor: Brand.success,
    statusBg: Brand.successSoft,
    amount: '₹299',
    technician: 'Deepak Verma',
    rating: 4.7,
    image: require('@/assets/images/microwave-service.webp'),
  },
];

function IconHistory() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"
      stroke={Brand.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 3v5h5" />
      <Path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <Path d="M12 7v5l4 2" />
    </Svg>
  );
}

function IconClock() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none"
      stroke={Brand.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 7v5l3 3" />
    </Svg>
  );
}

function StarFilled() {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="#FFC107" stroke="#FFC107" strokeWidth={1.5}>
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);

  const handleOpenDetail = useCallback((booking: BookingData) => {
    setSelectedBooking(booking);
    bottomSheetRef.current?.present();
  }, []);

  const handleCloseDetail = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Brand.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Service History</Text>
        <View style={styles.iconBadge}><IconHistory /></View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{HISTORY.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: Brand.successSoft }]}>
            <Text style={[styles.summaryNum, { color: Brand.success }]}>
              {HISTORY.filter(h => h.status === 'Completed').length}
            </Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: Brand.errorSoft }]}>
            <Text style={[styles.summaryNum, { color: Brand.error }]}>
              {HISTORY.filter(h => h.status === 'Cancelled').length}
            </Text>
            <Text style={styles.summaryLabel}>Cancelled</Text>
          </View>
        </View>

        {/* History cards */}
        {HISTORY.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handleOpenDetail(item)}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
          >
            {/* Top row */}
            <View style={styles.cardTop}>
              <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.cardInfo}>
                <Text style={styles.cardService}>{item.service}</Text>
                <Text style={styles.cardCategory}>{item.category}</Text>
                <View style={styles.cardDateRow}>
                  <IconClock />
                  <Text style={styles.cardDate}>{item.date}  •  {item.time}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.statusBg }]}>
                <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Bottom row */}
            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.techLabel}>Technician</Text>
                <Text style={styles.techName}>{item.technician}</Text>
              </View>
              <View style={styles.cardBottomRight}>
                {item.rating > 0 && (
                  <View style={styles.ratingRow}>
                    <StarFilled />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                )}
                <Text style={styles.amount}>{item.amount}</Text>
              </View>
            </View>
          </Pressable>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BookingDetailModal 
        ref={bottomSheetRef} 
        booking={selectedBooking} 
        onClose={handleCloseDetail} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.offWhite },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.base,
    backgroundColor: Brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
  },
  headerTitle: { ...Typography.h2, color: Brand.textPrimary },
  iconBadge: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Brand.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.screen, gap: Spacing.md },

  summaryRow: {
    flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xs,
  },
  summaryCard: {
    flex: 1, backgroundColor: Brand.white,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Brand.borderLight,
    paddingVertical: Spacing.md, alignItems: 'center',
    ...Shadow.sm,
  },
  summaryNum: { ...Typography.h2, color: Brand.textPrimary, fontWeight: '700' },
  summaryLabel: { ...Typography.caption, color: Brand.textMuted, marginTop: 2 },

  card: {
    backgroundColor: Brand.white,
    borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Brand.borderLight,
    padding: Spacing.md,
    ...Shadow.card,
  },
  cardTop: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  cardImage: {
    width: 60, height: 60, borderRadius: Radius.sm,
    backgroundColor: Brand.surface,
  },
  cardInfo: { flex: 1, gap: 3 },
  cardService: { ...Typography.h4, color: Brand.textPrimary },
  cardCategory: { ...Typography.small, color: Brand.textSecondary },
  cardDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cardDate: { ...Typography.caption, color: Brand.textMuted },
  statusBadge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: { ...Typography.caption, fontWeight: '700' },

  divider: { height: 1, backgroundColor: Brand.divider, marginVertical: Spacing.sm },

  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  techLabel: { ...Typography.caption, color: Brand.textMuted },
  techName: { ...Typography.smallMedium, color: Brand.textPrimary, fontWeight: '600', marginTop: 1 },
  cardBottomRight: { alignItems: 'flex-end', gap: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { ...Typography.smallMedium, color: Brand.textPrimary, fontWeight: '700' },
  amount: { ...Typography.h4, color: Brand.primary, fontWeight: '700' },
});
