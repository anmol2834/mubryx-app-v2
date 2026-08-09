/**
 * ScheduleSelector — Modal-based bottom sheet.
 * Uses React Native Modal instead of @gorhom/bottom-sheet to eliminate
 * touch-bleed-through on Android and fix horizontal ScrollView conflicts.
 *
 * Exports:
 *  - ScheduleCard  : in-scroll card (ASAP / Schedule radio)
 *  - ScheduleSheet : Modal sheet, rendered at screen root
 */

import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import type { ScheduleMode } from '../../hooks/useCheckout';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_H * 0.72;

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const MORNING_SLOTS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'];
const AFTERNOON_SLOTS = ['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'];
const EVENING_SLOTS = ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'];

function buildNextDays(count: number): Date[] {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ZapIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Polyline points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CalendarIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CheckCircleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={Brand.primary} />
      <Polyline points="8,12 11,15 16,9"
        stroke={Brand.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function RadioEmptyIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={Brand.border} strokeWidth={2} />
    </Svg>
  );
}

function ClockIcon({ color }: { color: string }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
      <Polyline points="12,7 12,12 15,15" stroke={color} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={Brand.textMuted} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function XIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={Brand.textSecondary} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Time Slot Group ──────────────────────────────────────────────────────────

const TimeSlotGroup = memo(function TimeSlotGroup({
  label, slots, selected, onSelect,
}: { label: string; slots: string[]; selected: string | null; onSelect: (s: string) => void }) {
  return (
    <View style={timeS.group}>
      <Text style={timeS.groupLabel}>{label}</Text>
      <View style={timeS.row}>
        {slots.map((slot) => {
          const active = selected === slot;
          return (
            <Pressable key={slot} style={[timeS.slot, active && timeS.slotActive]}
              onPress={() => onSelect(slot)} android_ripple={null}>
              <Text style={[timeS.slotText, active && timeS.slotTextActive]}>{slot}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const timeS = StyleSheet.create({
  group: { marginBottom: Spacing.base },
  groupLabel: {
    ...Typography.caption, color: Brand.textMuted, textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: Spacing.sm, fontWeight: '700',
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  slot: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Brand.border, backgroundColor: Brand.white,
    minWidth: 88, alignItems: 'center',
  },
  slotActive: { borderColor: Brand.primary, backgroundColor: Brand.primarySoft },
  slotText: { ...Typography.smallMedium, color: Brand.textSecondary, fontWeight: '500' },
  slotTextActive: { color: Brand.primary, fontWeight: '700' },
});

// ─── ScheduleCard (in-scroll) ─────────────────────────────────────────────────

interface ScheduleCardProps {
  mode: ScheduleMode;
  selectedDate: Date | null;
  selectedTime: string | null;
  onModeChange: (m: ScheduleMode) => void;
  onOpenSheet: () => void;
}

export const ScheduleCard = memo(function ScheduleCard({
  mode, selectedDate, selectedTime, onModeChange, onOpenSheet,
}: ScheduleCardProps) {
  const hasScheduled = selectedDate !== null && selectedTime !== null;

  const scheduledLabel = hasScheduled
    ? `${DAYS_SHORT[selectedDate!.getDay()]}, ${selectedDate!.getDate()} ${MONTHS_SHORT[selectedDate!.getMonth()]} · ${selectedTime}`
    : 'Pick a date & time';

  return (
    <View style={cardS.card}>
      {/* ASAP option */}
      <Pressable style={cardS.option} onPress={() => onModeChange('asap')} android_ripple={null}>
        <View style={cardS.optionLeft}>
          <View style={[cardS.iconWrap, cardS.iconWrapZap]}>
            <ZapIcon color={mode === 'asap' ? Brand.primary : Brand.textMuted} />
          </View>
          <View style={cardS.optionTexts}>
            <Text style={[cardS.optionTitle, mode === 'asap' && cardS.optionTitleActive]}>
              As Soon As Possible
            </Text>
            <Text style={cardS.optionSub}>Technician arrives within 2–4 hours</Text>
          </View>
        </View>
        {mode === 'asap' ? <CheckCircleIcon /> : <RadioEmptyIcon />}
      </Pressable>

      <View style={cardS.divider} />

      {/* Schedule option */}
      <Pressable style={cardS.option} onPress={() => { onModeChange('scheduled'); onOpenSheet(); }} android_ripple={null}>
        <View style={cardS.optionLeft}>
          <View style={[cardS.iconWrap, cardS.iconWrapCal]}>
            <CalendarIcon color={mode === 'scheduled' ? Brand.primary : Brand.textMuted} />
          </View>
          <View style={cardS.optionTexts}>
            <Text style={[cardS.optionTitle, mode === 'scheduled' && cardS.optionTitleActive]}>
              Schedule for Later
            </Text>
            <Text style={cardS.optionSub}>Choose a convenient date & time</Text>
          </View>
        </View>
        {mode === 'scheduled' ? <CheckCircleIcon /> : <RadioEmptyIcon />}
      </Pressable>

      {/* Scheduled time summary row — only shown after a date/time is confirmed */}
      {mode === 'scheduled' && hasScheduled && (
        <Pressable style={[cardS.scheduledRow, cardS.scheduledRowFilled]}
          onPress={onOpenSheet} android_ripple={null}>
          <View style={cardS.scheduledLeft}>
            <ClockIcon color={Brand.primary} />
            <Text style={[cardS.scheduledText, cardS.scheduledTextFilled]}>
              {scheduledLabel}
            </Text>
          </View>
          <ChevronRightIcon />
        </Pressable>
      )}
    </View>
  );
});

const cardS = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screen,
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  iconWrap: {
    width: 38, height: 38, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapZap: { backgroundColor: Brand.warningSoft },
  iconWrapCal: { backgroundColor: Brand.primarySoft },
  optionTexts: { flex: 1, gap: 2 },
  optionTitle: { ...Typography.bodyMedium, color: Brand.textSecondary, fontWeight: '500' },
  optionTitleActive: { color: Brand.textPrimary, fontWeight: '700' },
  optionSub: { ...Typography.caption, color: Brand.textMuted },
  divider: { height: 1, backgroundColor: Brand.borderLight, marginHorizontal: Spacing.base },
  scheduledRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: Spacing.base, marginBottom: Spacing.base, marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Brand.border,
    backgroundColor: Brand.surface,
  },
  scheduledRowFilled: { borderColor: Brand.primary, backgroundColor: Brand.primarySoft },
  scheduledLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  scheduledText: { ...Typography.smallMedium, color: Brand.textMuted },
  scheduledTextFilled: { color: Brand.primary, fontWeight: '600' },
});

// ─── ScheduleSheet (Modal) ────────────────────────────────────────────────────

interface ScheduleSheetProps {
  visible: boolean;
  selectedDate: Date | null;
  selectedTime: string | null;
  onConfirm: (date: Date, time: string) => void;
  onClose: () => void;
}

export const ScheduleSheet = memo(function ScheduleSheet({
  visible, selectedDate, selectedTime, onConfirm, onClose,
}: ScheduleSheetProps) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const [localDate, setLocalDate] = useState<Date | null>(selectedDate);
  const [localTime, setLocalTime] = useState<string | null>(selectedTime);
  const days = buildNextDays(14);

  // Sync external values when sheet opens
  useEffect(() => {
    if (visible) {
      setLocalDate(selectedDate);
      setLocalTime(selectedTime);
      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(SHEET_HEIGHT);
      backdropAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    if (localDate && localTime) {
      onConfirm(localDate, localTime);
      handleClose();
    }
  }, [localDate, localTime, onConfirm, handleClose]);

  const canConfirm = localDate !== null && localTime !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[sheetS.backdrop, { opacity: backdropAnim }]} />
      </TouchableWithoutFeedback>

      {/* Sheet panel */}
      <Animated.View
        style={[
          sheetS.sheet,
          { paddingBottom: insets.bottom + 16 },
          { transform: [{ translateY: slideAnim }] },
        ]}>
        {/* Handle */}
        <View style={sheetS.handleWrap}>
          <View style={sheetS.handle} />
        </View>

        {/* Header */}
        <View style={sheetS.header}>
          <View style={sheetS.headerLeft}>
            <CalendarIcon color={Brand.primary} />
            <Text style={sheetS.headerTitle}>Schedule Service</Text>
          </View>
          <Pressable style={sheetS.closeBtn} onPress={handleClose} hitSlop={8} android_ripple={null}>
            <XIcon />
          </Pressable>
        </View>

        <ScrollView
          style={sheetS.scrollArea}
          contentContainerStyle={sheetS.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Date picker — horizontal scroll */}
          <Text style={sheetS.sectionLabel}>Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={sheetS.dateRow}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled">
            {days.map((day, idx) => {
              const isSelected = localDate?.toDateString() === day.toDateString();
              const isToday = idx === 0;
              return (
                <Pressable
                  key={day.toISOString()}
                  style={[sheetS.dayChip, isSelected && sheetS.dayChipActive]}
                  onPress={() => setLocalDate(day)}
                  android_ripple={null}>
                  <Text style={[sheetS.dayName, isSelected && sheetS.dayNameActive]}>
                    {isToday ? 'Today' : DAYS_SHORT[day.getDay()]}
                  </Text>
                  <Text style={[sheetS.dayNum, isSelected && sheetS.dayNumActive]}>
                    {day.getDate()}
                  </Text>
                  <Text style={[sheetS.dayMonth, isSelected && sheetS.dayMonthActive]}>
                    {MONTHS_SHORT[day.getMonth()]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Month label */}
          {localDate && (
            <Text style={sheetS.monthLabel}>
              {MONTHS_FULL[localDate.getMonth()]} {localDate.getFullYear()}
            </Text>
          )}

          {/* Time slots */}
          <Text style={[sheetS.sectionLabel, { marginTop: Spacing.base }]}>Select Time</Text>
          <TimeSlotGroup label="Morning" slots={MORNING_SLOTS} selected={localTime} onSelect={setLocalTime} />
          <TimeSlotGroup label="Afternoon" slots={AFTERNOON_SLOTS} selected={localTime} onSelect={setLocalTime} />
          <TimeSlotGroup label="Evening" slots={EVENING_SLOTS} selected={localTime} onSelect={setLocalTime} />
        </ScrollView>

        {/* Confirm button */}
        <View style={sheetS.footer}>
          <Pressable
            style={[sheetS.confirmBtn, !canConfirm && sheetS.confirmBtnDisabled]}
            onPress={canConfirm ? handleConfirm : undefined}
            android_ripple={null}>
            <Text style={sheetS.confirmText}>
              {canConfirm
                ? `Confirm · ${DAYS_SHORT[localDate!.getDay()]}, ${localDate!.getDate()} ${MONTHS_SHORT[localDate!.getMonth()]} · ${localTime}`
                : 'Select date & time to confirm'}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
});

const sheetS = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,22,40,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Brand.white,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
      },
      android: { elevation: 24 },
    }),
  },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Brand.border,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Brand.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerTitle: { ...Typography.h4, color: Brand.textPrimary, fontWeight: '700' },
  closeBtn: {
    width: 34, height: 34, borderRadius: Radius.full,
    backgroundColor: Brand.surface, alignItems: 'center', justifyContent: 'center',
  },
  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.screen, paddingTop: Spacing.base, paddingBottom: Spacing.sm },
  sectionLabel: {
    ...Typography.caption, color: Brand.textMuted, textTransform: 'uppercase',
    letterSpacing: 0.8, fontWeight: '700', marginBottom: Spacing.sm,
  },
  dateRow: { gap: Spacing.sm, paddingBottom: Spacing.sm },
  dayChip: {
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Brand.border,
    backgroundColor: Brand.white, minWidth: 62,
  },
  dayChipActive: { borderColor: Brand.primary, backgroundColor: Brand.primarySoft },
  dayName: { ...Typography.caption, color: Brand.textMuted, fontWeight: '600' },
  dayNameActive: { color: Brand.primary },
  dayNum: { fontSize: 20, fontWeight: '700', color: Brand.textPrimary, lineHeight: 26 },
  dayNumActive: { color: Brand.primary },
  dayMonth: { ...Typography.caption, color: Brand.textMuted },
  dayMonthActive: { color: Brand.primary },
  monthLabel: {
    ...Typography.smallMedium, color: Brand.textSecondary,
    marginTop: Spacing.sm, marginBottom: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Brand.borderLight,
  },
  confirmBtn: {
    backgroundColor: Brand.navy, borderRadius: Radius.xl,
    paddingVertical: 16, alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmText: {
    ...Typography.bodyMedium, color: Brand.white,
    fontWeight: '700', letterSpacing: -0.2,
  },
});
