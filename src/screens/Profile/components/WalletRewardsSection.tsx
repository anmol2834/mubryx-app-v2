import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

function WalletIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x="1" y="4" width="22" height="16" rx="2" ry="2"
        stroke={Brand.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M1 10h22" stroke={Brand.white} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function StarIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="#F9A825">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

interface Props {
  walletBalance: number;
  rewardPoints: number;
}

export const WalletRewardsSection = memo(function WalletRewardsSection({ walletBalance, rewardPoints }: Props) {
  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>Wallet & Rewards</Text>
      <View style={s.row}>
        {/* Wallet */}
        <LinearGradient colors={Brand.gradientPrimary} style={[s.card, s.walletCard]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={s.cardIconRow}>
            <View style={s.walletIconWrap}><WalletIcon /></View>
            <Text style={s.walletLabel}>Mubryx Wallet</Text>
          </View>
          <Text style={s.walletBalance}>₹{walletBalance}</Text>
          <Text style={s.walletSub}>Available balance</Text>
          <Pressable style={s.addMoneyBtn}
            android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}>
            <Text style={s.addMoneyText}>+ Add Money</Text>
          </Pressable>
        </LinearGradient>

        {/* Rewards */}
        <View style={[s.card, s.rewardsCard]}>
          <View style={s.cardIconRow}>
            <View style={s.rewardsIconWrap}><StarIcon /></View>
            <Text style={s.rewardsLabel}>Reward Points</Text>
          </View>
          <Text style={s.rewardsPoints}>{rewardPoints.toLocaleString()}</Text>
          <Text style={s.rewardsSub}>pts · Worth ₹{Math.floor(rewardPoints / 10)}</Text>
          <Pressable style={s.redeemBtn}
            android_ripple={{ color: '#FFF9C4', borderless: false }}>
            <Text style={s.redeemText}>Redeem →</Text>
          </Pressable>
        </View>
      </View>

      {/* Cashback banner */}
      <View style={s.cashbackBanner}>
        <Text style={s.cashbackEmoji}>🎉</Text>
        <View style={s.cashbackTexts}>
          <Text style={s.cashbackTitle}>₹50 Cashback Pending</Text>
          <Text style={s.cashbackSub}>From your last booking · Credited in 24h</Text>
        </View>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    backgroundColor: Brand.white,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  sectionTitle: { ...Typography.h4, color: Brand.textPrimary, marginBottom: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  card: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    gap: 4,
    ...Shadow.sm,
  },
  walletCard: {},
  rewardsCard: {
    backgroundColor: Brand.offWhite,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  cardIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  walletIconWrap: {
    width: 28, height: 28, borderRadius: Radius.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  walletLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  walletBalance: { fontSize: 22, fontWeight: '700', color: Brand.white, letterSpacing: -0.5 },
  walletSub: { ...Typography.caption, color: 'rgba(255,255,255,0.7)' },
  addMoneyBtn: {
    marginTop: 6, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full, paddingVertical: 7, alignItems: 'center', overflow: 'hidden',
  },
  addMoneyText: { ...Typography.caption, color: Brand.white, fontWeight: '700' },
  rewardsIconWrap: {
    width: 28, height: 28, borderRadius: Radius.xs,
    backgroundColor: '#FEFDE8', alignItems: 'center', justifyContent: 'center',
  },
  rewardsLabel: { ...Typography.caption, color: Brand.textSecondary, fontWeight: '600' },
  rewardsPoints: { fontSize: 22, fontWeight: '700', color: Brand.textPrimary, letterSpacing: -0.5 },
  rewardsSub: { ...Typography.caption, color: Brand.textMuted },
  redeemBtn: {
    marginTop: 6, backgroundColor: '#FEFDE8',
    borderRadius: Radius.full, paddingVertical: 7, alignItems: 'center',
    borderWidth: 1, borderColor: '#FFD54F', overflow: 'hidden',
  },
  redeemText: { ...Typography.caption, color: '#F57F17', fontWeight: '700' },
  cashbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Brand.successSoft, borderRadius: Radius.lg,
    padding: Spacing.base, borderWidth: 1, borderColor: '#A5D6A7',
  },
  cashbackEmoji: { fontSize: 22 },
  cashbackTexts: { flex: 1, gap: 2 },
  cashbackTitle: { ...Typography.smallMedium, color: '#1B5E20', fontWeight: '700' },
  cashbackSub: { ...Typography.caption, color: '#388E3C' },
});
