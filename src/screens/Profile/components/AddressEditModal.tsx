import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SavedAddress } from '../constants';

interface AddressEditModalProps {
  address: SavedAddress | null;
  onSave: (updatedAddress: SavedAddress) => void;
  onClose: () => void;
}

const TAGS = ['Home', 'Office', 'Other'] as const;
type Tag = typeof TAGS[number];

export const AddressEditModal = forwardRef<BottomSheetModal, AddressEditModalProps>(
  function AddressEditModal({ address, onSave, onClose }, ref) {
    const insets = useSafeAreaInsets();
    
    // Form state
    const [tag, setTag] = useState<Tag>('Home');
    const [fullAddress, setFullAddress] = useState('');
    const [landmark, setLandmark] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    // When the address prop changes, pre-fill the form
    useEffect(() => {
      if (address) {
        setTag(address.label);
        setFullAddress(address.address);
        setIsDefault(address.isDefault);
        setLandmark(''); // We don't have landmark in our mock data yet, but good for future
      }
    }, [address]);

    const snapPoints = useMemo(() => ['80%', '95%'], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
        />
      ),
      []
    );

    const handleSave = () => {
      if (!address || !fullAddress.trim()) return;
      
      Keyboard.dismiss();
      onSave({
        ...address,
        label: tag,
        address: fullAddress.trim(),
        isDefault,
      });
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        onDismiss={onClose}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.sheetBackground}
        enablePanDownToClose
      >
        <BottomSheetScrollView
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + Spacing.xl }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Edit Address</Text>
          <Text style={styles.subtitle}>Update the details for this saved location.</Text>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Save as</Text>
              <View style={styles.tagRow}>
                {TAGS.map((t) => {
                  const isActive = tag === t;
                  return (
                    <Pressable
                      key={t}
                      style={[styles.tagPill, isActive && styles.tagPillActive]}
                      onPress={() => setTag(t)}
                    >
                      <Text style={[styles.tagText, isActive && styles.tagTextActive]}>
                        {t === 'Home' ? '🏠' : t === 'Office' ? '🏢' : '📍'} {t}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Complete Address</Text>
              <View style={styles.inputWrap}>
                <BottomSheetTextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Flat / House No / Floor / Building / Area"
                  placeholderTextColor={Brand.textMuted}
                  value={fullAddress}
                  onChangeText={setFullAddress}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nearby Landmark (Optional)</Text>
              <View style={styles.inputWrap}>
                <BottomSheetTextInput
                  style={styles.input}
                  placeholder="e.g. Near Apollo Hospital"
                  placeholderTextColor={Brand.textMuted}
                  value={landmark}
                  onChangeText={setLandmark}
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchTexts}>
                <Text style={styles.switchTitle}>Set as Default</Text>
                <Text style={styles.switchDesc}>Make this your primary address for bookings</Text>
              </View>
              <Switch
                value={isDefault}
                onValueChange={setIsDefault}
                trackColor={{ false: Brand.borderLight, true: Brand.primary }}
                thumbColor={Brand.white}
              />
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }, !fullAddress.trim() && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!fullAddress.trim()}
          >
            <Text style={styles.saveBtnText}>Save Address</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Brand.white,
    borderRadius: 24,
  },
  indicator: {
    backgroundColor: Brand.borderLight,
    width: 48,
    height: 6,
    borderRadius: 3,
    marginTop: 10,
  },
  contentContainer: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.md,
  },
  title: {
    ...Typography.h3,
    color: Brand.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body,
    color: Brand.textSecondary,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    ...Typography.smallMedium,
    color: Brand.textSecondary,
    fontWeight: '600',
  },
  inputWrap: {
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  input: {
    ...Typography.body,
    color: Brand.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    height: 100,
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tagPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  tagPillActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  tagText: {
    ...Typography.bodyMedium,
    color: Brand.textSecondary,
    fontWeight: '600',
  },
  tagTextActive: {
    color: Brand.white,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  switchTexts: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  switchTitle: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  switchDesc: {
    ...Typography.caption,
    color: Brand.textSecondary,
  },
  saveBtn: {
    backgroundColor: Brand.primary,
    paddingVertical: 16,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: Brand.surface,
    borderColor: Brand.borderLight,
    borderWidth: 1,
  },
  saveBtnText: {
    ...Typography.h4,
    color: Brand.white,
    fontWeight: '700',
  },
});
