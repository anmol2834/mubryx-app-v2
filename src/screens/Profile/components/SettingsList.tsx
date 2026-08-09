import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo, useCallback, useState, useRef, useEffect } from 'react';
import { Animated, Easing, Keyboard, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';
import { type SettingsSection, type UserProfile } from '../constants';

function SettingIcon({ type, color }: { type: string; color: string }) {
  const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' as const, stroke: color, strokeWidth: '2', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (type) {
    case 'user': return <Svg {...base}><Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx="12" cy="7" r="4" /></Svg>;
    case 'phone': return <Svg {...base}><Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.89-1.89a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></Svg>;
    case 'mail': return <Svg {...base}><Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><Polyline points="22,6 12,13 2,6" /></Svg>;
    case 'bell': return <Svg {...base}><Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><Path d="M13.73 21a2 2 0 0 1-3.46 0" /></Svg>;
    case 'globe': return <Svg {...base}><Circle cx="12" cy="12" r="10" /><Path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></Svg>;
    case 'pin': return <Svg {...base}><Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><Circle cx="12" cy="10" r="3" /></Svg>;
    case 'fingerprint': return <Svg {...base}><Path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" /><Path d="M14 13.12c0 2.38 0 6.38-1 8.88" /><Path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" /><Path d="M2 12a10 10 0 0 1 18-6" /><Path d="M2 17.5a14.5 14.5 0 0 0 4.24 5.11" /><Path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" /></Svg>;
    case 'help': return <Svg {...base}><Circle cx="12" cy="12" r="10" /><Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><Path d="M12 17h.01" /></Svg>;
    case 'chat': return <Svg {...base}><Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Svg>;
    case 'star': return <Svg {...base}><Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></Svg>;
    case 'heart': return <Svg {...base}><Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></Svg>;
    case 'share': return <Svg {...base}><Circle cx="18" cy="5" r="3" /><Circle cx="6" cy="12" r="3" /><Circle cx="18" cy="19" r="3" /><Path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" /></Svg>;
    case 'doc': return <Svg {...base}><Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><Polyline points="14 2 14 8 20 8" /><Path d="M16 13H8M16 17H8M10 9H8" /></Svg>;
    case 'shield': return <Svg {...base}><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Svg>;
    case 'info': return <Svg {...base}><Circle cx="12" cy="12" r="10" /><Path d="M12 16v-4M12 8h.01" /></Svg>;
    default: return <Svg {...base}><Circle cx="12" cy="12" r="10" /></Svg>;
  }
}

function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Polyline points="9 18 15 12 9 6" stroke={Brand.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

interface RowProps {
  row: SettingsSection['rows'][number];
  onPress: (id: string) => void;
  biometricEnabled: boolean;
  onToggleBiometric: () => void;
  isLast: boolean;
  user?: UserProfile;
  onUpdateName?: (name: string) => void;
}

const SettingsRow = memo(function SettingsRow({ row, onPress, biometricEnabled, onToggleBiometric, isLast, user, onUpdateName }: RowProps) {
  const handlePress = useCallback(() => {
    if (row.id === 'edit_profile') {
      startEditing();
    } else {
      onPress(row.id);
    }
  }, [row.id, onPress]);

  // Animation State
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user?.name || '');
  
  const animValue = useRef(new Animated.Value(0)).current;

  // Sync tempName when user changes
  useEffect(() => {
    if (user?.name) setTempName(user.name);
  }, [user?.name]);

  const inputRef = useRef<TextInput>(null);

  const startEditing = () => {
    setIsEditing(true);
    Animated.timing(animValue, {
      toValue: 1,
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
    
    // Focus keyboard smoothly after animation begins
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const closeEditing = () => {
    Keyboard.dismiss();
    Animated.timing(animValue, {
      toValue: 0,
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start(() => setIsEditing(false));
  };

  const handleSave = () => {
    if (tempName.trim()) {
      onUpdateName?.(tempName.trim());
    } else {
      // Revert if empty
      setTempName(user?.name || '');
    }
    closeEditing();
  };

  // Interpolations
  const normalTranslateX = animValue.interpolate({ inputRange: [0, 1], outputRange: [0, 50] });
  const normalOpacity = animValue.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const editTranslateX = animValue.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] });
  const editOpacity = animValue.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  // If this is the edit profile row, we render a custom container
  if (row.id === 'edit_profile') {
    return (
      <View style={styles.editRowWrapper}>
        <Animated.View 
          pointerEvents={isEditing ? 'auto' : 'none'}
          style={[StyleSheet.absoluteFill, styles.row, styles.editInputContainer, { opacity: editOpacity, transform: [{ translateX: editTranslateX }] }]}
        >
          <View style={[styles.rowIcon, { backgroundColor: row.iconBg }]}>
            <SettingIcon type={row.iconType} color={row.iconColor} />
          </View>
          <TextInput
            ref={inputRef}
            style={styles.editInput}
            value={tempName}
            onChangeText={setTempName}
            placeholder="Enter your name"
            placeholderTextColor={Brand.textMuted}
            onSubmitEditing={handleSave}
            returnKeyType="done"
          />
          <Pressable style={styles.editSaveBtn} onPress={handleSave}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M5 12h14M12 5l7 7-7 7" stroke={Brand.white} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        </Animated.View>

        <Animated.View style={{ opacity: normalOpacity, transform: [{ translateX: normalTranslateX }] }} pointerEvents={isEditing ? 'none' : 'auto'}>
          <Pressable
            style={styles.row}
            onPress={handlePress}
            android_ripple={{ color: Brand.surface, borderless: false }}>
            <View style={[styles.rowIcon, { backgroundColor: row.iconBg }]}>
              <SettingIcon type={row.iconType} color={row.iconColor} />
            </View>
            <View style={styles.rowTexts}>
              <Text style={[styles.rowLabel, row.danger && styles.dangerText]}>{row.label}</Text>
              <Text style={styles.rowSub} numberOfLines={1}>{user?.name || 'Name, photo, bio'}</Text>
            </View>
            <ChevronRight />
          </Pressable>
        </Animated.View>
        {!isLast && <View style={styles.rowDivider} />}
      </View>
    );
  }

  return (
    <>
      <Pressable
        style={styles.row}
        onPress={handlePress}
        android_ripple={{ color: Brand.surface, borderless: false }}>
        <View style={[styles.rowIcon, { backgroundColor: row.iconBg }]}>
          <SettingIcon type={row.iconType} color={row.iconColor} />
        </View>
        <View style={styles.rowTexts}>
          <Text style={[styles.rowLabel, row.danger && styles.dangerText]}>{row.label}</Text>
          {(() => {
            let subtitle = row.subtitle;
            if (user) {
              if (row.id === 'phone') subtitle = user.phone;
              if (row.id === 'email') subtitle = user.email || 'Add email address';
            }
            return subtitle ? <Text style={styles.rowSub} numberOfLines={1}>{subtitle}</Text> : null;
          })()}
        </View>
        {row.hasToggle && row.id === 'biometric' ? (
          <Switch
            value={biometricEnabled}
            onValueChange={onToggleBiometric}
            trackColor={{ false: Brand.border, true: Brand.primarySoft }}
            thumbColor={biometricEnabled ? Brand.primary : Brand.textMuted}
          />
        ) : row.hasChevron ? (
          <ChevronRight />
        ) : null}
      </Pressable>
      {!isLast && <View style={styles.rowDivider} />}
    </>
  );
});

interface Props {
  sections: SettingsSection[];
  onRowPress: (id: string) => void;
  biometricEnabled: boolean;
  onToggleBiometric: () => void;
  user?: UserProfile;
  onUpdateName?: (name: string) => void;
}

export const SettingsList = memo(function SettingsList({ sections, onRowPress, biometricEnabled, onToggleBiometric, user, onUpdateName }: Props) {
  return (
    <View style={styles.container}>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionCard}>
            {section.rows.map((row, idx) => (
              <SettingsRow
                key={row.id}
                row={row}
                onPress={onRowPress}
                biometricEnabled={biometricEnabled}
                onToggleBiometric={onToggleBiometric}
                isLast={idx === section.rows.length - 1}
                user={user}
                onUpdateName={onUpdateName}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.offWhite,
    paddingTop: Spacing.base,
  },
  section: {
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    ...Typography.label,
    color: Brand.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: Brand.white,
    marginHorizontal: Spacing.screen,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 13,
    gap: Spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTexts: { flex: 1, gap: 2 },
  rowLabel: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '500',
  },
  dangerText: { color: Brand.error },
  rowSub: {
    ...Typography.caption,
    color: Brand.textMuted,
  },
  rowDivider: {
    height: 1,
    backgroundColor: Brand.borderLight,
    marginLeft: Spacing.base + 36 + Spacing.md,
  },
  editRowWrapper: {
    position: 'relative',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  editInputContainer: {
    backgroundColor: Brand.white,
    zIndex: 10,
  },
  editInput: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    backgroundColor: Brand.offWhite,
    height: 40,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  editSaveBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  }
});
