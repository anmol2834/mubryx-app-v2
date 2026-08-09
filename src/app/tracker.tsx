import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  StatusBar, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { Brand, Typography, Spacing, Radius, Shadow } from '@/constants/brand';

const ACTIVE_BOOKING = {
  id: 'BK-20250724',
  service: 'AC Gas Refill Service',
  category: 'AC Service',
  date: '29 Jul 2025',
  time: '11:00 AM - 12:00 PM',
  amount: '₹2,599',
  technician: {
    name: 'Ravi Kumar',
    phone: '+91 98765 43210',
    rating: 4.9,
    totalJobs: 312,
    avatar: 'RK',
    avatarColor: '#1565C0',
  },
  currentStep: 2,
  steps: [
    { id: 1, label: 'Booking Confirmed', time: '10:00 AM', done: true },
    { id: 2, label: 'Technician Assigned', time: '10:15 AM', done: true },
    { id: 3, label: 'Technician En Route', time: '10:45 AM', done: false, active: true },
    { id: 4, label: 'Service In Progress', time: '--', done: false },
    { id: 5, label: 'Service Completed', time: '--', done: false },
  ],
};

function IconTracker() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"
      stroke={Brand.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
      <Circle cx={12} cy={10} r={3} />
    </Svg>
  );
}

function IconPhone() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke={Brand.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.85a16 16 0 0 0 6.29 6.29l1.95-1.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z" />
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

export default function TrackerScreen() {
  const insets = useSafeAreaInsets();
  const [activeId] = useState(ACTIVE_BOOKING.id);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Brand.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Track Service</Text>
        <View style={styles.iconBadge}><IconTracker /></View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Booking ID card */}
        <View style={styles.bookingCard}>
          <View style={styles.bookingRow}>
            <View>
              <Text style={styles.bookingIdLabel}>Booking ID</Text>
              <Text style={styles.bookingId}>{ACTIVE_BOOKING.id}</Text>
            </View>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>
          <View style={styles.bookingDivider} />
          <Text style={styles.bookingService}>{ACTIVE_BOOKING.service}</Text>
          <Text style={styles.bookingCategory}>{ACTIVE_BOOKING.category}</Text>
          <View style={styles.bookingMeta}>
            <Text style={styles.bookingMetaText}>📅  {ACTIVE_BOOKING.date}</Text>
            <Text style={styles.bookingMetaText}>⏰  {ACTIVE_BOOKING.time}</Text>
            <Text style={styles.bookingMetaText}>💰  {ACTIVE_BOOKING.amount}</Text>
          </View>
        </View>

        {/* Technician card */}
        <View style={styles.techCard}>
          <Text style={styles.sectionTitle}>Your Technician</Text>
          <View style={styles.techRow}>
            <View style={[styles.techAvatar, { backgroundColor: ACTIVE_BOOKING.technician.avatarColor }]}>
              <Text style={styles.techAvatarText}>{ACTIVE_BOOKING.technician.avatar}</Text>
            </View>
            <View style={styles.techInfo}>
              <Text style={styles.techName}>{ACTIVE_BOOKING.technician.name}</Text>
              <View style={styles.techMeta}>
                <StarFilled />
                <Text style={styles.techRating}>{ACTIVE_BOOKING.technician.rating}</Text>
                <Text style={styles.techJobs}>• {ACTIVE_BOOKING.technician.totalJobs} jobs</Text>
              </View>
            </View>
            <Pressable style={styles.callBtn}>
              <IconPhone />
              <Text style={styles.callText}>Call</Text>
            </Pressable>
          </View>
        </View>

        {/* Tracking steps */}
        <View style={styles.stepsCard}>
          <Text style={styles.sectionTitle}>Live Tracking</Text>
          {ACTIVE_BOOKING.steps.map((step, index) => {
            const isLast = index === ACTIVE_BOOKING.steps.length - 1;
            return (
              <View key={step.id} style={styles.stepRow}>
                {/* Line */}
                <View style={styles.stepLeft}>
                  <View style={[
                    styles.stepDot,
                    step.done && styles.stepDotDone,
                    (step as any).active && styles.stepDotActive,
                  ]}>
                    {step.done && (
                      <Svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                        stroke={Brand.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <Path d="M20 6L9 17l-5-5" />
                      </Svg>
                    )}
                    {(step as any).active && <View style={styles.stepPulse} />}
                  </View>
                  {!isLast && <View style={[styles.stepLine, step.done && styles.stepLineDone]} />}
                </View>
                {/* Content */}
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepLabel,
                    step.done && styles.stepLabelDone,
                    (step as any).active && styles.stepLabelActive,
                  ]}>{step.label}</Text>
                  <Text style={styles.stepTime}>{step.time}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Cancel note */}
        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            Need help? Call our support at <Text style={styles.noteLink}>1800-123-4567</Text> (toll free)
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.offWhite },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen, paddingVertical: Spacing.base,
    backgroundColor: Brand.white, borderBottomWidth: 1, borderBottomColor: Brand.borderLight,
  },
  headerTitle: { ...Typography.h2, color: Brand.textPrimary },
  iconBadge: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Brand.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.screen, gap: Spacing.md },

  bookingCard: {
    backgroundColor: Brand.white, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Brand.borderLight,
    padding: Spacing.base, ...Shadow.card,
  },
  bookingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bookingIdLabel: { ...Typography.caption, color: Brand.textMuted },
  bookingId: { ...Typography.h4, color: Brand.textPrimary, fontWeight: '700', marginTop: 2 },
  activeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Brand.successSoft, paddingHorizontal: Spacing.sm,
    paddingVertical: 4, borderRadius: Radius.full,
  },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Brand.success },
  activeText: { ...Typography.caption, color: Brand.success, fontWeight: '700' },
  bookingDivider: { height: 1, backgroundColor: Brand.divider, marginVertical: Spacing.sm },
  bookingService: { ...Typography.h4, color: Brand.textPrimary },
  bookingCategory: { ...Typography.small, color: Brand.textSecondary, marginTop: 2 },
  bookingMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.sm },
  bookingMetaText: { ...Typography.small, color: Brand.textSecondary },

  techCard: {
    backgroundColor: Brand.white, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Brand.borderLight,
    padding: Spacing.base, ...Shadow.card,
  },
  sectionTitle: { ...Typography.h4, color: Brand.textPrimary, marginBottom: Spacing.md },
  techRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  techAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  techAvatarText: { fontSize: 16, fontWeight: '700', color: Brand.white },
  techInfo: { flex: 1, gap: 4 },
  techName: { ...Typography.h4, color: Brand.textPrimary },
  techMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  techRating: { ...Typography.smallMedium, color: Brand.textPrimary, fontWeight: '700' },
  techJobs: { ...Typography.small, color: Brand.textMuted },
  callBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1.5, borderColor: Brand.primary,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 7,
  },
  callText: { ...Typography.smallMedium, color: Brand.primary, fontWeight: '700' },

  stepsCard: {
    backgroundColor: Brand.white, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Brand.borderLight,
    padding: Spacing.base, ...Shadow.card,
  },
  stepRow: { flexDirection: 'row', gap: Spacing.md },
  stepLeft: { alignItems: 'center', width: 24 },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: Brand.borderLight,
    backgroundColor: Brand.white,
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  stepDotDone: { backgroundColor: Brand.success, borderColor: Brand.success },
  stepDotActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  stepPulse: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: Brand.white,
  },
  stepLine: { flex: 1, width: 2, backgroundColor: Brand.borderLight, marginVertical: 2 },
  stepLineDone: { backgroundColor: Brand.success },
  stepContent: { flex: 1, paddingBottom: Spacing.base, gap: 2 },
  stepLabel: { ...Typography.smallMedium, color: Brand.textMuted },
  stepLabelDone: { color: Brand.success, fontWeight: '600' },
  stepLabelActive: { color: Brand.primary, fontWeight: '700' },
  stepTime: { ...Typography.caption, color: Brand.textMuted },

  noteCard: {
    backgroundColor: Brand.primarySoft, borderRadius: Radius.md,
    padding: Spacing.md,
  },
  noteText: { ...Typography.small, color: Brand.textSecondary, textAlign: 'center', lineHeight: 20 },
  noteLink: { color: Brand.primary, fontWeight: '700' },
});
