import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

export interface BookingData {
  id: string;
  service: string;
  category: string;
  date: string;
  time: string;
  status: string;
  statusColor: string;
  statusBg: string;
  amount: string;
  technician: string;
  rating: number;
  image: any;
}

interface BookingDetailModalProps {
  booking: BookingData | null;
  onClose: () => void;
}

function StarFilled() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="#FFC107" stroke="#FFC107" strokeWidth={1.5}>
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

function MapPinIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={Brand.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <Circle cx={12} cy={10} r={3} />
    </Svg>
  );
}

function ReceiptIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={Brand.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <Polyline points="14 2 14 8 20 8" />
      <Path d="M16 13H8" />
      <Path d="M16 17H8" />
      <Path d="M10 9H8" />
    </Svg>
  );
}

function ClockIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={Brand.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={10} />
      <Path d="M12 6v6l4 2" />
    </Svg>
  );
}

export const BookingDetailModal = forwardRef<BottomSheetModal, BookingDetailModalProps>(({ booking, onClose }, ref) => {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['75%', '90%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    []
  );

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!booking) return null;

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.bottomSheetBg}
      enablePanDownToClose
    >
      <BottomSheetScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header section */}
        <View style={styles.header}>
          <Image source={booking.image} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.headerInfo}>
            <View style={[styles.statusBadge, { backgroundColor: booking.statusBg }]}>
              <Text style={[styles.statusText, { color: booking.statusColor }]}>{booking.status}</Text>
            </View>
            <Text style={styles.serviceName}>{booking.service}</Text>
            <Text style={styles.categoryName}>{booking.category}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Schedule & Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <ClockIcon />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>Schedule</Text>
              <Text style={styles.detailValue}>{booking.date} at {booking.time}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <MapPinIcon />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>Service Location</Text>
              <Text style={styles.detailValue}>Home - 123 Tech Park, Sector 45</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Technician */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technician</Text>
          <View style={styles.techCard}>
            <View style={styles.techAvatar}>
              <Text style={styles.techAvatarText}>{booking.technician !== '-' ? booking.technician.charAt(0) : '?'}</Text>
            </View>
            <View style={styles.techInfo}>
              <Text style={styles.techName}>{booking.technician}</Text>
              {booking.rating > 0 && (
                <View style={styles.ratingWrap}>
                  <StarFilled />
                  <Text style={styles.techRating}>{booking.rating}</Text>
                </View>
              )}
            </View>
            {booking.status === 'Completed' && booking.technician !== '-' && (
              <Pressable style={styles.reviewBtn}>
                <Text style={styles.reviewBtnText}>Tip & Rate</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Payment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <ReceiptIcon />
          </View>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Item Total</Text>
            <Text style={styles.paymentValue}>{booking.amount}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Taxes & Fees</Text>
            <Text style={styles.paymentValue}>Included</Text>
          </View>
          
          <View style={styles.paymentTotalRow}>
            <Text style={styles.paymentTotalLabel}>Total Amount</Text>
            <Text style={styles.paymentTotalValue}>{booking.amount}</Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Pressable 
            style={styles.primaryBtn} 
            onPress={() => ref && 'current' in ref && ref.current?.dismiss()}
          >
            <Text style={styles.primaryBtnText}>
              {booking.status === 'Upcoming' ? 'Track Service' : 'Rebook Service'}
            </Text>
          </Pressable>
        </View>

      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: Brand.border,
    width: 40,
  },
  bottomSheetBg: {
    backgroundColor: Brand.offWhite,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  content: {
    padding: Spacing.screen,
  },
  header: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroImage: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    backgroundColor: Brand.surface,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: 2,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  serviceName: {
    ...Typography.h3,
    color: Brand.textPrimary,
  },
  categoryName: {
    ...Typography.smallMedium,
    color: Brand.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Brand.borderLight,
    marginVertical: Spacing.lg,
  },
  section: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.h4,
    color: Brand.textPrimary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  detailTextCol: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 2,
  },
  detailLabel: {
    ...Typography.caption,
    color: Brand.textMuted,
  },
  detailValue: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '500',
    marginTop: 2,
  },
  techCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.white,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    ...Shadow.sm,
  },
  techAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  techAvatarText: {
    ...Typography.h3,
    color: Brand.primary,
  },
  techInfo: {
    flex: 1,
  },
  techName: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '600',
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  techRating: {
    ...Typography.smallMedium,
    color: Brand.textSecondary,
  },
  reviewBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: Brand.surface,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  reviewBtnText: {
    ...Typography.smallMedium,
    color: Brand.primary,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  paymentLabel: {
    ...Typography.body,
    color: Brand.textSecondary,
  },
  paymentValue: {
    ...Typography.body,
    color: Brand.textPrimary,
    fontWeight: '500',
  },
  paymentTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Brand.borderLight,
  },
  paymentTotalLabel: {
    ...Typography.h4,
    color: Brand.textPrimary,
    fontWeight: '700',
  },
  paymentTotalValue: {
    ...Typography.h3,
    color: Brand.primary,
  },
  actionContainer: {
    marginTop: Spacing.xl,
  },
  primaryBtn: {
    backgroundColor: Brand.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    ...Shadow.sm,
  },
  primaryBtnText: {
    ...Typography.h4,
    color: Brand.white,
  },
});
