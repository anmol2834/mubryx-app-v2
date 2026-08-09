import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo, useCallback, useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, Platform, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Polyline } from 'react-native-svg';

const SHEET_HEIGHT = 400; // Starting offset for animation

function LogoutIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke={Brand.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="16 17 21 12 16 7"
        stroke={Brand.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 12H9" stroke={Brand.error} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

interface Props {
  visible: boolean;
  onLogoutPress: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutSection = memo(function LogoutSection({ visible, onLogoutPress, onConfirm, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
    ]).start(() => onCancel());
  }, [onCancel]);

  return (
    <>
      <View style={styles.container}>
        <Pressable
          style={styles.logoutBtn}
          onPress={onLogoutPress}
          android_ripple={{ color: Brand.errorSoft, borderless: false }}>
          <LogoutIcon />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
        <Text style={styles.versionText}>Mubryx v1.0.0</Text>
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={handleClose}>
        
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[sheetS.backdrop, { opacity: backdropAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            sheetS.sheet,
            { paddingBottom: Math.max(insets.bottom, 16) + 16 },
            { transform: [{ translateY: slideAnim }] },
          ]}>
          <View style={sheetS.handleWrap}>
            <View style={sheetS.handle} />
          </View>

          <View style={sheetS.header}>
            <View style={sheetS.headerLeft}>
              <LogoutIcon />
              <Text style={sheetS.headerTitle}>Log Out?</Text>
            </View>
            <Pressable style={sheetS.closeBtn} onPress={handleClose} hitSlop={8} android_ripple={null}>
              <XIcon />
            </Pressable>
          </View>

          <View style={sheetS.content}>
            <Text style={sheetS.sheetSubtitle}>
              You'll need to sign in again to access your bookings, wallet, and saved addresses.
            </Text>
            
            <View style={sheetS.footer}>
              <Pressable
                style={sheetS.confirmBtn}
                onPress={() => {
                  onConfirm();
                  handleClose();
                }}
                android_ripple={null}>
                <Text style={sheetS.confirmText}>Yes, Log Out</Text>
              </Pressable>
              
              <Pressable
                style={sheetS.cancelBtn}
                onPress={handleClose}
                android_ripple={null}>
                <Text style={sheetS.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.offWhite,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
    backgroundColor: Brand.white,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    paddingHorizontal: Spacing.base,
    borderWidth: 1.5,
    borderColor: Brand.errorSoft,
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: Brand.error,
  },
  versionText: {
    ...Typography.caption,
    color: Brand.textMuted,
  },
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
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.base,
  },
  sheetSubtitle: {
    ...Typography.small,
    color: Brand.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  footer: {
    gap: Spacing.md,
  },
  confirmBtn: {
    backgroundColor: Brand.error,
    borderRadius: Radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmText: {
    ...Typography.bodyMedium, color: Brand.white,
    fontWeight: '700', letterSpacing: -0.2,
  },
  cancelBtn: {
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Brand.border,
  },
  cancelText: {
    ...Typography.bodyMedium, color: Brand.textSecondary,
    fontWeight: '700', letterSpacing: -0.2,
  },
});
