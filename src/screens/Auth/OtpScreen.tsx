import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { useAuthStore } from '@/store/authStore';
import { useLocation } from '@/context/LocationContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import AnimatedRN, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

// ─── Design tokens (match login screen) ──────────────────────────────────────
const INK     = '#111111';   // dark buttons to match login theme
const INK_BTN = '#222222';

const OTP_LENGTH     = 6;

// ─── Icons ────────────────────────────────────────────────────────────────────

function ShieldIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={Brand.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 12l2 2 4-4"
        stroke={Brand.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ArrowLeft() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 5l-7 7 7 7"
        stroke={Brand.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ArrowRight() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={Brand.white} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HeadphoneIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M3 18v-6a9 9 0 0 1 18 0v6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── OTP Box ──────────────────────────────────────────────────────────────────

interface OtpBoxProps {
  value: string;
  isFocused: boolean;
  hasError: boolean;
  isSuccess: boolean;
}

const OtpBox = memo(function OtpBox({ value, isFocused, hasError, isSuccess }: OtpBoxProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (value) {
      scale.value = withSequence(
        withTiming(1.12, { duration: 80 }),
        withTiming(1,    { duration: 80 }),
      );
    }
  }, [value]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedRN.View style={[
      s.otpBox,
      isFocused  && s.otpBoxFocused,
      !!value && !hasError && !isSuccess && s.otpBoxFilled,
      hasError   && s.otpBoxError,
      isSuccess  && s.otpBoxSuccess,
      animStyle,
    ]}>
      <Text style={[s.otpDigit, hasError && s.otpDigitError, isSuccess && s.otpDigitSuccess]}>
        {value || ''}
      </Text>
      {!value && !isFocused && <View style={s.otpDot} />}
    </AnimatedRN.View>
  );
});

/** 98••••••21 */
function maskPhone(phone: string): string {
  if (phone.length !== 10) return '••••••••••';
  return `${phone.slice(0, 2)}••••••${phone.slice(-2)}`;
}

// ─── Name Toaster Modal (slides down from top) ───────────────────────────────

interface NameToasterProps {
  visible: boolean;
  onSubmit: (name: string) => Promise<void>;
}

const NameToaster = memo(function NameToaster({ visible, onSubmit }: NameToasterProps) {
  const insets      = useSafeAreaInsets();
  const slideY      = useRef(new Animated.Value(-340)).current;
  const backdropOp  = useRef(new Animated.Value(0)).current;

  const [name,    setName]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const inputRef  = useRef<TextInput>(null);

  const isValid = name.trim().length >= 2;

  // Slide in / out
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(backdropOp, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(() => inputRef.current?.focus(), 100);
      });
    } else {
      Animated.parallel([
        Animated.timing(slideY, { toValue: -340, duration: 250, useNativeDriver: true }),
        Animated.timing(backdropOp, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleSubmit = useCallback(async () => {
    if (!isValid) { setError('Please enter your full name (at least 2 characters).'); return; }
    setError('');
    setLoading(true);
    try {
      await onSubmit(name.trim());
    } catch (err: any) {
      setError(err?.message || 'Failed to save name. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [name, isValid, onSubmit]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" statusBarTranslucent>
      {/* Dark backdrop */}
      <Animated.View style={[ns.backdrop, { opacity: backdropOp }]} />

      {/* Toaster card slides from top */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : undefined}
        style={ns.kavWrap}
        pointerEvents="box-none">
        <Animated.View
          style={[
            ns.card,
            { paddingTop: insets.top + 16 },
            { transform: [{ translateY: slideY }] },
          ]}>
          {/* Drag pill */}
          <View style={ns.pill} />

          {/* Header */}
          <View style={ns.headerRow}>
            <Text style={ns.wave}>👋</Text>
            <View>
              <Text style={ns.title}>Almost there!</Text>
              <Text style={ns.subtitle}>What should we call you?</Text>
            </View>
          </View>

          {/* Name input */}
          <View style={ns.fieldWrap}>
            <Text style={ns.label}>Your Name</Text>
            <TextInput
              ref={inputRef}
              style={[ns.input, !!error && ns.inputError]}
              placeholder="e.g. Arjun Mehta"
              placeholderTextColor={Brand.textMuted}
              value={name}
              onChangeText={(t) => { setName(t); setError(''); }}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            {!!error
              ? <Text style={ns.errorText}>{typeof error === 'string' ? error : (error as any)?.message || String(error)}</Text>
              : <Text style={ns.helperText}>This is how you'll appear in your profile.</Text>
            }
          </View>

          {/* Submit button */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={({ pressed }) => [ns.btnWrap, pressed && { opacity: 0.88 }]}>
            <LinearGradient
              colors={[INK, INK_BTN]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={ns.btn}>
              {loading
                ? <ActivityIndicator color={Brand.white} />
                : (
                  <>
                    <Text style={ns.btnText}>Let's Go</Text>
                    <View style={ns.btnArrow}><ArrowRight /></View>
                  </>
                )}
            </LinearGradient>
          </Pressable>

          {/* Bottom pill / safe area */}
          <View style={{ height: insets.bottom + 8 }} />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const ns = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  kavWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  card: {
    backgroundColor: Brand.white,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.base,
    gap: Spacing.lg,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20 },
      android: { elevation: 12 },
    }),
  },
  pill: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Brand.border,
    marginBottom: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  wave: { fontSize: 32 },
  title: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Brand.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    ...Typography.body,
    color: Brand.textSecondary,
    marginTop: 2,
  },
  fieldWrap: { gap: 8 },
  label: {
    ...Typography.smallMedium,
    color: Brand.textSecondary,
    fontWeight: '600' as const,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Brand.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500' as const,
    color: Brand.textPrimary,
    backgroundColor: Brand.white,
  },
  inputError:  { borderColor: Brand.error },
  errorText:   { ...Typography.caption, color: Brand.error },
  helperText:  { ...Typography.caption, color: Brand.textMuted },
  btnWrap: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    ...Shadow.md,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: Radius.full,
    gap: Spacing.md,
  },
  btnText: {
    color: Brand.white,
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  btnArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── OTP Screen ───────────────────────────────────────────────────────────────

export const OtpScreen = memo(function OtpScreen() {
  const insets = useSafeAreaInsets();
  
  const pendingPhone = useAuthStore((s) => s.pendingPhone);
  const devOtp = useAuthStore((s) => s.devOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const completeRegistration = useAuthStore((s) => s.completeRegistration);
  const otpResendAvailableAt = useAuthStore((s) => s.otpResendAvailableAt);

  const { openSearchModal, address } = useLocation();
  const router = useRouter();

  const [showNameToaster, setShowNameToaster] = useState(false);

  const [digits,       setDigits]       = useState<string[]>(
    devOtp && devOtp.length === OTP_LENGTH ? devOtp.split('') : Array(OTP_LENGTH).fill('')
  );
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [isSuccess,    setIsSuccess]    = useState(false);
  const [timer,        setTimer]        = useState(0);
  const [resending,    setResending]    = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-fill devOtp if available
  useEffect(() => {
    if (devOtp && devOtp.length === OTP_LENGTH) {
      setDigits(devOtp.split(''));
    }
  }, [devOtp]);

  // Auto-focus first box
  useEffect(() => {
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  // Countdown timer derived from authStore state
  useEffect(() => {
    if (!otpResendAvailableAt) {
      setTimer(0);
      return;
    }
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((otpResendAvailableAt - Date.now()) / 1000));
      setTimer(remaining);
      if (remaining > 0) {
        timerRef.current = setTimeout(updateTimer, 1000);
      }
    };
    updateTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [otpResendAvailableAt]);

  const handleChange = useCallback((text: string) => {
    setError('');
    setIsSuccess(false);
    const cleaned = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    const newDigits = cleaned.split('').concat(Array(OTP_LENGTH - cleaned.length).fill(''));
    setDigits(newDigits);
    setFocusedIndex(cleaned.length < OTP_LENGTH ? cleaned.length : OTP_LENGTH - 1);
  }, []);

  const handleVerify = useCallback(async () => {
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) { setError('Please enter the complete 6-digit OTP.'); return; }
    setLoading(true);
    setError('');
    const result = await verifyOtp(otp);
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? 'Verification failed. Please try again.');
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => { inputRefs.current[0]?.focus(); setFocusedIndex(0); }, 50);
      return;
    }

    setIsSuccess(true);

    if (result.isNewUser) {
      setTimeout(() => setShowNameToaster(true), 300);
    } else {
      router.replace('/');
      setTimeout(() => openSearchModal(), 400);
    }
  }, [digits, verifyOtp, router, openSearchModal]);

  const handleResend = useCallback(async () => {
    if (timer > 0 || !pendingPhone) return;
    setResending(true);
    setDigits(Array(OTP_LENGTH).fill(''));
    setError('');
    setIsSuccess(false);
    await sendOtp(pendingPhone);
    setResending(false);
    setTimeout(() => { inputRefs.current[0]?.focus(); setFocusedIndex(0); }, 50);
  }, [timer, pendingPhone, sendOtp]);

  const handleNameSubmit = useCallback(async (name: string) => {
    const res = await completeRegistration(name);
    if (!res.ok) {
      throw new Error(res.error || 'Failed to save full name.');
    }
    router.replace('/');
    setTimeout(() => openSearchModal(), 400);
  }, [completeRegistration, router, openSearchModal]);

  const timerLabel = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Brand.offWhite} />

      <KeyboardAvoidingView
        style={s.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.inner}>
          
          {/* ── Background image (top ~35% of screen) ────────────────── */}
          <View style={s.bgWrap}>
            <Image source={require('@/assets/images/login-bg image.png')} style={s.bgImage} resizeMode="cover" />
            <Pressable style={[s.backBtnIcon, { top: insets.top + 10 }]} onPress={() => router.back()} hitSlop={12}>
              <ArrowLeft />
            </Pressable>
            <View style={[s.helpBtn, { top: insets.top + 10 }]}>
              <HeadphoneIcon />
              <Text style={s.helpText}>Help</Text>
            </View>
          </View>

          {/* ── White card ───────────────────────────────────────────── */}
          <View style={s.card}>
            <View style={s.cardHeaderRow}>
              <View>
                <Text style={s.cardTitle}>Verify OTP</Text>
                <Text style={s.cardSubtitle}>Enter the 6-digit OTP sent to{'\n'}<Text style={s.phoneHighlight}>+91 {maskPhone(pendingPhone)}</Text></Text>
              </View>
              <View style={s.secureBadge}>
                <ShieldIcon />
                <Text style={s.secureText}>Secure Login</Text>
              </View>
            </View>

            {!!devOtp && (
              <View style={s.devOtpBanner}>
                <Text style={s.devOtpText}>💡 Dev Mode OTP: <Text style={s.devOtpCode}>{devOtp}</Text></Text>
              </View>
            )}

            {/* OTP boxes */}
            <View style={s.otpContainer}>
              <View style={s.otpRow}>
                {digits.map((d, i) => (
                  <OtpBox key={i} value={d} isFocused={focusedIndex === i} hasError={!!error} isSuccess={isSuccess} />
                ))}
              </View>
              
              {/* Single Invisible Input for perfect one-click keyboard opening */}
              <View style={[StyleSheet.absoluteFill, { zIndex: 10 }]}>
                <TextInput
                  ref={(r) => { inputRefs.current[0] = r; }}
                  style={s.hiddenSingleInput}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  value={digits.join('').replace(/ /g, '')}
                  onChangeText={handleChange}
                  onFocus={() => {
                    const len = digits.join('').trim().length;
                    setFocusedIndex(len < OTP_LENGTH ? len : OTP_LENGTH - 1);
                  }}
                  caretHidden
                  autoFocus
                  textContentType="oneTimeCode"
                />
              </View>
            </View>

            {!!error && (
              <AnimatedRN.View entering={FadeInDown.duration(300)} style={s.errorWrap}>
                <Text style={s.errorText}>{typeof error === 'string' ? error : (error as any)?.message || String(error)}</Text>
              </AnimatedRN.View>
            )}

            {isSuccess && (
              <AnimatedRN.View entering={FadeInDown.duration(300)} style={s.successWrap}>
                <Text style={s.successText}>✓  OTP Verified!</Text>
              </AnimatedRN.View>
            )}

            <Pressable
              onPress={handleVerify}
              disabled={loading || isSuccess}
              style={[s.otpBtn, (loading || isSuccess) && { opacity: 0.8 }]}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : (
                  <>
                    <Text style={s.otpBtnText}>{isSuccess ? '✓  Verified' : 'Verify OTP'}</Text>
                    {!isSuccess && <View style={s.otpBtnArrow}><ArrowRight /></View>}
                  </>
                )}
            </Pressable>

            <View style={s.resendRow}>
              {timer > 0 ? (
                <View style={s.timerWrap}>
                  <Text style={s.timerLabel}>Resend OTP in </Text>
                  <Text style={s.timerCount}>{timerLabel}</Text>
                </View>
              ) : (
                <Pressable onPress={handleResend} disabled={resending} hitSlop={8}>
                  {resending
                    ? <ActivityIndicator size="small" color={INK} />
                    : <Text style={s.resendLink}>Resend OTP</Text>}
                </Pressable>
              )}
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

      {/* Name toaster — slides from top, shown only for new users */}
      <NameToaster visible={showNameToaster} onSubmit={handleNameSubmit} />
    </View>
  );
});

const BOX_SIZE = 46;

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
  backBtnIcon: {
    position: 'absolute', left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Brand.white, alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
  },

  // White card
  card: {
    flex: 1, 
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
  phoneHighlight: { color: INK, fontWeight: '700' },

  otpContainer: { position: 'relative', marginBottom: 16, marginTop: 10 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  otpBox: {
    width: BOX_SIZE, height: BOX_SIZE + 10,
    borderRadius: Radius.md, borderWidth: 1.5,
    borderColor: '#E5E5E5', backgroundColor: Brand.white,
    alignItems: 'center', justifyContent: 'center',
  },
  otpBoxFocused:  { borderColor: INK, ...Shadow.sm },
  otpBoxFilled:   { borderColor: INK },
  otpBoxError:    { borderColor: Brand.error, backgroundColor: Brand.errorSoft },
  otpBoxSuccess:  { borderColor: Brand.success, backgroundColor: Brand.successSoft },
  otpDigit:       { fontSize: 22, fontWeight: '700', color: INK },
  otpDigitError:  { color: Brand.error },
  otpDigitSuccess:{ color: Brand.success },
  otpDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E5E5E5' },

  hiddenSingleInput:  { flex: 1, opacity: 0, color: 'transparent', width: '100%', height: '100%' },

  errorWrap: {
    backgroundColor: Brand.errorSoft, borderRadius: Radius.sm,
    paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12,
  },
  errorText: { ...Typography.smallMedium, color: Brand.error, textAlign: 'center' },

  successWrap: {
    backgroundColor: Brand.successSoft, borderRadius: Radius.sm,
    paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12,
  },
  successText: { ...Typography.smallMedium, color: Brand.success, textAlign: 'center', fontWeight: '600' },

  // OTP button — black
  otpBtn: {
    marginTop: 20, backgroundColor: INK,
    borderRadius: Radius.full, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    ...Shadow.md,
  },
  otpBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' as const, letterSpacing: 0.3 },
  otpBtnArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

  resendRow:   { alignItems: 'center', marginTop: 24 },
  timerWrap:   { flexDirection: 'row', alignItems: 'center' },
  timerLabel:  { ...Typography.small, color: Brand.textMuted },
  timerCount:  { ...Typography.smallMedium, color: INK, fontWeight: '700' },
  resendLink:  { ...Typography.bodyMedium, color: INK, fontWeight: '700' },

  devOtpBanner: {
    backgroundColor: '#FEF3C7', borderRadius: Radius.sm,
    paddingVertical: 8, paddingHorizontal: 12, marginBottom: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#FCD34D',
  },
  devOtpText: { fontSize: 13, color: '#92400E', fontWeight: '600' },
  devOtpCode: { fontSize: 14, color: '#78350F', fontWeight: '800', letterSpacing: 2 },

  // Trust footer
  footer: { backgroundColor: INK, paddingHorizontal: Spacing.screen, paddingTop: Spacing.base, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  footerTitle: { color: '#fff', fontSize: 13, fontWeight: '700' as const },
  footerSub:   { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  customerBadge: { backgroundColor: '#FBBF24', paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  customerCount: { fontSize: 10, fontWeight: '800' as const, color: INK },
  customerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)', lineHeight: 14 },
});
