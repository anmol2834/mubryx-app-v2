import React, { memo, useState, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator, StatusBar, StyleSheet, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { useAuthStore, isValidIndianNumber } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Theme tokens — black/white, matches the design image ────────────────────
const INK    = '#111111';   // primary button / dark elements
const INK2   = '#222222';
const BORDER = '#E5E5E5';

// ─── India flag ───────────────────────────────────────────────────────────────
function IndiaFlag() {
  return (
    <Svg width={22} height={16} viewBox="0 0 22 16" style={{ borderRadius: 2 }}>
      <Rect width={22} height={5.33} y={0}    fill="#FF9933" />
      <Rect width={22} height={5.33} y={5.33} fill="#FFFFFF" />
      <Rect width={22} height={5.33} y={10.67} fill="#138808" />
      <Circle cx={11} cy={8} r={1.8} fill="none" stroke="#000080" strokeWidth={0.5} />
    </Svg>
  );
}

// ─── Green check ─────────────────────────────────────────────────────────────
function GreenDot() {
  return <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E', marginRight: 14 }} />;
}

// ─── Arrow right ─────────────────────────────────────────────────────────────
function ArrowRight() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Headphone / Help icon ────────────────────────────────────────────────────
function HeadphoneIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M3 18v-6a9 9 0 0 1 18 0v6"
        stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"
        stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Shield icon ─────────────────────────────────────────────────────────────
function ShieldIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        fill={INK + '15'} stroke={INK} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 12l2 2 4-4" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

// ─── Google icon ─────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

// ─── Apple icon ──────────────────────────────────────────────────────────────
function AppleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={INK}>
      <Path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.28.07 2.17.65 2.92.69.96-.19 1.87-.79 3.1-.84 1.49.07 2.59.65 3.3 1.61-2.9 1.72-2.25 5.47.45 6.52-.56 1.49-1.29 2.97-1.77 4.9zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </Svg>
  );
}

// ─── LoginScreen ─────────────────────────────────────────────────────────────
export const LoginScreen = memo(function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const sendOtp = useAuthStore((s) => s.sendOtp);
  const pendingPhone = useAuthStore((s) => s.pendingPhone);
  const otpExpiresAt = useAuthStore((s) => s.otpExpiresAt);

  // Social login not yet implemented in the backend — stubs for now
  const googleLogin = async () => { console.warn('Google login not yet implemented'); };
  const appleLogin = async () => { console.warn('Apple login not yet implemented'); };

  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [focused, setFocused] = useState(false);

  const isValid = isValidIndianNumber(phone);

  const handlePhoneChange = useCallback((text: string) => {
    setPhone(text.replace(/\D/g, '').slice(0, 10));
    setError('');
  }, []);

  const handleSendOtp = useCallback(async () => {
    if (!isValid) { setError('Enter a valid 10-digit mobile number.'); return; }
    setError('');

    // **Session Reuse Logic**
    // If user enters same phone and OTP is still valid, don't spam backend!
    if (pendingPhone === phone && otpExpiresAt && otpExpiresAt > Date.now()) {
      router.push('/otp' as any);
      return;
    }

    setLoading(true);
    const result = await sendOtp(phone);
    setLoading(false);
    if (!result.ok) { setError(result.error ?? 'Something went wrong.'); return; }
    router.push('/otp' as any);
  }, [phone, isValid, sendOtp, router, pendingPhone, otpExpiresAt]);

  const handleGoogleLogin = useCallback(async () => {
    setError('Google Sign-In coming soon.');
  }, []);

  const handleAppleLogin = useCallback(async () => {
    setError('Apple Sign-In coming soon.');
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        style={s.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        <View style={s.inner}>
          {/* ── Background image (top ~42% of screen) ────────────────── */}
          <View style={s.bgWrap}>
          <Image
            source={require('@/assets/images/login-bg image.png')}
            style={s.bgImage}
            resizeMode="cover"
          />
          {/* Help button — top right */}
          <View style={[s.helpBtn, { top: insets.top + 10 }]}>
            <HeadphoneIcon />
            <Text style={s.helpText}>Help</Text>
          </View>
        </View>

        {/* ── White card (overlaps bg image slightly) ───────────────── */}
        <View style={s.card}>
          {/* Card header row */}
          <View style={s.cardHeaderRow}>
            <View>
              <Text style={s.cardTitle}>Welcome back!</Text>
              <Text style={s.cardSubtitle}>Login to continue with Mubryx</Text>
            </View>
            <View style={s.secureBadge}>
              <ShieldIcon />
              <Text style={s.secureText}>Secure Login</Text>
            </View>
          </View>

          {/* Mobile Number */}
          <Text style={s.fieldLabel}>Mobile Number</Text>
          <View style={[s.inputRow, focused && s.inputRowFocused, !!error && s.inputRowError]}>
            {/* Fixed +91 — India only */}
            <View style={s.prefix}>
              <IndiaFlag />
              <Text style={s.prefixText}>+91</Text>
            </View>
            <View style={s.prefixDivider} />
            <TextInput
              style={s.input}
              placeholder="0000000000"
              placeholderTextColor={Brand.textMuted}
              keyboardType="number-pad"
              value={phone}
              onChangeText={handlePhoneChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={10}
              returnKeyType="done"
              onSubmitEditing={handleSendOtp}
            />
            {isValid && <GreenDot />}
          </View>
          {!!error
            ? <Text style={s.errorText}>{typeof error === 'string' ? error : (error as any)?.message || String(error)}</Text>
            : <Text style={s.helperText}>We will send you a one-time password (OTP)</Text>}

          {/* Send OTP button */}
          <Pressable
            onPress={handleSendOtp}
            disabled={loading}
            style={({ pressed }) => [s.otpBtn, pressed && { opacity: 0.85 }]}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : (
                <>
                  <Text style={s.otpBtnText}>Send OTP</Text>
                  <View style={s.otpBtnArrow}><ArrowRight /></View>
                </>
              )}
          </Pressable>

          {/* Divider */}
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or continue with</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Social buttons */}
          <View style={s.socialRow}>
            <Pressable style={({ pressed }) => [s.socialBtn, pressed && { opacity: 0.8 }]} onPress={handleGoogleLogin}>
              <GoogleIcon />
              <Text style={s.socialBtnText}>Continue with Google</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [s.socialBtn, pressed && { opacity: 0.8 }]} onPress={handleAppleLogin}>
              <AppleIcon />
              <Text style={s.socialBtnText}>Continue with Apple</Text>
            </Pressable>
          </View>

          {/* Privacy note */}
          <View style={s.privacyRow}>
            <ShieldIcon />
            <Text style={s.privacyText}>We never share your personal details</Text>
          </View>
        </View>
      </View>

      {/* ── Trust footer bar ─────────────────────────────────────── */}
        <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>
          <View style={s.footerLeft}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(255,255,255,0.15)" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
              <Path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </Svg>
            <View>
              <Text style={s.footerTitle}>Trusted by thousands of homes</Text>
              <Text style={s.footerSub}>Quick · Reliable · Professional</Text>
            </View>
          </View>
          <View style={s.footerRight}>
            <View style={s.customerBadge}>
              <Text style={s.customerCount}>5K+</Text>
            </View>
            <Text style={s.customerLabel}>Happy{'\n'}Customers</Text>
          </View>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
});

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: INK },
  keyboardView: { flex: 1 },
  inner: { flex: 1, backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column' },

  // Background image
  bgWrap:  { width: '100%', height: '35%', minHeight: 120, position: 'relative', overflow: 'hidden' },
  bgImage: { width: '100%', height: '100%' },
  helpBtn: {
    position: 'absolute', right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: INK, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: Radius.full,
  },
  helpText: { color: '#fff', fontSize: 13, fontWeight: '600' as const },

  // White card
  card: {
    flex: 1, // Take up remaining vertical space
    backgroundColor: Brand.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
    ...Shadow.card,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: Spacing.lg },
  cardTitle:    { fontSize: 20, fontWeight: '800' as const, color: INK, letterSpacing: -0.3 },
  cardSubtitle: { ...Typography.small, color: Brand.textSecondary, marginTop: 3 },
  secureBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 2 },
  secureText:   { fontSize: 11, fontWeight: '600' as const, color: INK },

  // Field
  fieldLabel: { ...Typography.smallMedium, color: Brand.textSecondary, fontWeight: '600' as const, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: BORDER,
    borderRadius: Radius.md, backgroundColor: Brand.white,
    overflow: 'hidden', marginBottom: 7,
  },
  inputRowFocused: { borderColor: INK },
  inputRowError:   { borderColor: Brand.error },
  prefix: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 14, backgroundColor: Brand.surface },
  prefixText:    { ...Typography.bodyMedium, color: INK, fontWeight: '700' as const },
  prefixDivider: { width: 1, height: 24, backgroundColor: BORDER },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 14, ...Typography.body, color: INK, letterSpacing: 1 },
  errorText:  { ...Typography.caption, color: Brand.error, marginLeft: 2 },
  helperText: { ...Typography.caption, color: Brand.textMuted, marginLeft: 2 },

  // OTP button — black
  otpBtn: {
    marginTop: 20, backgroundColor: INK,
    borderRadius: Radius.full, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    ...Shadow.md,
  },
  otpBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' as const, letterSpacing: 0.3 },
  otpBtnArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { ...Typography.caption, color: Brand.textMuted },

  // Social
  socialRow: { flexDirection: 'row', gap: Spacing.sm },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 12, borderRadius: Radius.md, borderWidth: 1.5, borderColor: BORDER, backgroundColor: Brand.white },
  socialBtnText: { fontSize: 12, fontWeight: '600' as const, color: INK },

  // Privacy
  privacyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 16, marginBottom: 4 },
  privacyText: { ...Typography.caption, color: Brand.textMuted },

  // Trust footer
  footer: { backgroundColor: INK, paddingHorizontal: Spacing.screen, paddingTop: Spacing.base, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  footerTitle: { color: '#fff', fontSize: 13, fontWeight: '700' as const },
  footerSub:   { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatarRow:   { flexDirection: 'row' },
  avatar:      { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: INK },
  customerBadge: { backgroundColor: '#FBBF24', paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  customerCount: { fontSize: 10, fontWeight: '800' as const, color: INK },
  customerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', lineHeight: 14 },
});
