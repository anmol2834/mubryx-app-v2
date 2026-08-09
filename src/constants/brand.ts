import { Platform } from 'react-native';

export const Brand = {
  primary: '#1565C0',
  primaryLight: '#1E88E5',
  primaryDark: '#0D47A1',
  primarySoft: '#E3F2FD',
  accent: '#2196F3',
  accentLight: '#64B5F6',

  navy: '#0A1628',
  navyMid: '#0D2137',

  white: '#FFFFFF',
  offWhite: '#F8FAFF',
  surface: '#F2F6FF',
  surfaceCard: '#FFFFFF',

  textPrimary: '#0A1628',
  textSecondary: '#546E7A',
  textMuted: '#90A4AE',
  textOnPrimary: '#FFFFFF',

  border: '#E8EEF7',
  borderLight: '#F0F4FB',
  divider: '#EEF2F8',

  success: '#00C853',
  successSoft: '#E8F5E9',
  warning: '#FF6F00',
  warningSoft: '#FFF8E1',
  error: '#D32F2F',
  errorSoft: '#FFEBEE',

  gradientPrimary: ['#1565C0', '#1E88E5'] as readonly [string, string],
  gradientNavy: ['#0A1628', '#0D2137'] as readonly [string, string],
  gradientHero1: ['#0D47A1', '#1565C0', '#1E88E5'] as readonly [string, string, string],
  gradientHero2: ['#1A237E', '#283593', '#3949AB'] as readonly [string, string, string],
  gradientHero3: ['#004D40', '#00695C', '#00897B'] as readonly [string, string, string],
  gradientOffer1: ['#E65100', '#F57C00'] as readonly [string, string],
  gradientOffer2: ['#6A1B9A', '#8E24AA'] as readonly [string, string],
  gradientOffer3: ['#1565C0', '#0288D1'] as readonly [string, string],
} as const;

export const Typography = {
  hero: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700' as const, lineHeight: 28, letterSpacing: -0.2 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
  h4: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  smallMedium: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.3 },
  label: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16, letterSpacing: 0.5 },
} as const;

export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 999,
} as const;

export const Shadow = {
  sm: Platform.select({
    ios: { shadowColor: '#1565C0', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: { shadowColor: '#1565C0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16 },
    android: { elevation: 4 },
    default: {},
  }),
  lg: Platform.select({
    ios: { shadowColor: '#1565C0', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 24 },
    android: { elevation: 8 },
    default: {},
  }),
  card: Platform.select({
    ios: { shadowColor: '#0A1628', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 },
    android: { elevation: 3 },
    default: {},
  }),
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  screen: 20,
} as const;
