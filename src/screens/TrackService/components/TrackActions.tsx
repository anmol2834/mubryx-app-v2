import { Brand, Radius, Shadow, Spacing } from '@/constants/brand';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import type { TrackStageId } from '../../Profile/constants';

// ─── Button icons (SVG, no emoji) ─────────────────────────────────────────────

function StarIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill={Brand.white}>
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

function InvoiceIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke={Brand.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="14,2 14,8 20,8"
        stroke={Brand.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 13H8M16 17H8M10 9H8"
        stroke={Brand.primary} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function RepeatIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Polyline points="17,1 21,5 17,9"
        stroke={Brand.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3 11V9a4 4 0 0 1 4-4h14"
        stroke={Brand.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="7,23 3,19 7,15"
        stroke={Brand.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 13v2a4 4 0 0 1-4 4H3"
        stroke={Brand.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Bottom Actions ───────────────────────────────────────────────────────────

interface BottomProps {
  currentStage: TrackStageId;
  onHelp: () => void;
  onCancel: () => void;
  onInvoice: () => void;
  onBookAgain: () => void;
  onRate: () => void;
}

export const TrackBottomActions = memo(function TrackBottomActions({
  currentStage,
  onHelp,
  onCancel,
  onInvoice,
  onBookAgain,
  onRate,
}: BottomProps) {
  const isCompleted = currentStage === 'completed';
  const canCancel = currentStage === 'confirmed' || currentStage === 'assigned';

  return (
    <View style={s.bottomContainer}>
      {isCompleted ? (
        <View style={s.rowBtns}>
          <Pressable style={[s.secondaryBtn, s.flex1]} onPress={onInvoice}
            android_ripple={{ color: Brand.primarySoft, borderless: false }}>
            <InvoiceIcon />
            <Text style={s.secondaryBtnText}>Invoice</Text>
          </Pressable>
          <Pressable style={[s.secondaryBtn, s.flex1]} onPress={onBookAgain}
            android_ripple={{ color: Brand.primarySoft, borderless: false }}>
            <RepeatIcon />
            <Text style={s.secondaryBtnText}>Book Again</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Pressable style={s.helpBtn} onPress={onHelp}
            android_ripple={{ color: Brand.primarySoft, borderless: false }}>
            <Text style={s.helpBtnText}>Need Help</Text>
          </Pressable>
          {canCancel && (
            <Pressable style={s.cancelBtn} onPress={onCancel}
              android_ripple={{ color: '#FFCDD2', borderless: false }}>
              <Text style={s.cancelBtnText}>Cancel Booking</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
});

const s = StyleSheet.create({
  bottomContainer: {
    backgroundColor: Brand.white,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Brand.borderLight,
  },
  primaryBtn: {
    backgroundColor: Brand.primary,
    borderRadius: Radius.full,
    paddingVertical: 15,
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadow.md,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.white,
  },
  rowBtns: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  flex1: { flex: 1 },
  secondaryBtn: {
    borderRadius: Radius.full,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Brand.primary,
    overflow: 'hidden',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.primary,
  },
  helpBtn: {
    backgroundColor: Brand.primary,
    borderRadius: Radius.full,
    paddingVertical: 15,
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadow.md,
  },
  helpBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.white,
  },
  cancelBtn: {
    borderRadius: Radius.full,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Brand.error,
    overflow: 'hidden',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.error,
  },
});
