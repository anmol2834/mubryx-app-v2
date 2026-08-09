import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { SavedAddress } from '@/types/address';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SavedAddressSelectorSheetProps {
  addresses: SavedAddress[];
  selectedAddressId: string | null;
  onSelectAddress: (address: SavedAddress) => void;
  onSetDefaultAddress?: (id: string) => void;
  onAddNewAddress: () => void;
  onClose: () => void;
}

const LABEL_ICONS: Record<string, string> = {
  Home: '🏠',
  Office: '🏢',
  Other: '📍',
};

export const SavedAddressSelectorSheet = forwardRef<BottomSheetModal, SavedAddressSelectorSheetProps>(
  function SavedAddressSelectorSheet(
    { addresses, selectedAddressId, onSelectAddress, onSetDefaultAddress, onAddNewAddress, onClose },
    ref
  ) {
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['65%', '85%'], []);

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

    const handleAddressPress = (item: SavedAddress) => {
      onSelectAddress(item);
      if (onSetDefaultAddress && !item.isDefault) {
        onSetDefaultAddress(item.id);
      }
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
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Select Service Address</Text>
            <Text style={styles.subtitle}>
              Where should our technician perform the service?
            </Text>
          </View>

          <View style={styles.addressList}>
            {addresses.map((item) => {
              const isSelected = item.id === selectedAddressId;
              const icon = LABEL_ICONS[item.label] || '📍';

              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.addressCard,
                    isSelected && styles.addressCardSelected,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => handleAddressPress(item)}
                >
                  <View style={styles.radioOuter}>
                    {isSelected ? (
                      <View style={styles.radioInnerSelected}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    ) : (
                      <View style={styles.radioInnerUnselected} />
                    )}
                  </View>

                  <View style={styles.cardContent}>
                    <View style={styles.labelRow}>
                      <Text style={styles.iconText}>{icon}</Text>
                      <Text style={styles.labelTitle}>{item.label}</Text>
                      {item.isDefault ? (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      ) : (
                        onSetDefaultAddress && (
                          <Pressable
                            style={styles.setDefaultLink}
                            onPress={() => onSetDefaultAddress(item.id)}
                            hitSlop={8}
                          >
                            <Text style={styles.setDefaultLinkText}>Set Default</Text>
                          </Pressable>
                        )
                      )}
                    </View>
                    <Text style={styles.addressText} numberOfLines={3}>
                      {item.completeAddress || item.address}
                      {item.landmark ? ` (${item.landmark})` : ''}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
            onPress={onAddNewAddress}
          >
            <Text style={styles.addBtnIcon}>+</Text>
            <Text style={styles.addBtnText}>Add New Address</Text>
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
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h3,
    color: Brand.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body,
    color: Brand.textSecondary,
  },
  addressList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: Brand.borderLight,
    gap: Spacing.md,
  },
  addressCardSelected: {
    backgroundColor: Brand.primarySoft,
    borderColor: Brand.primary,
  },
  radioOuter: {
    marginTop: 2,
  },
  radioInnerSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: Brand.white,
    fontSize: 12,
    fontWeight: '800',
  },
  radioInnerUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Brand.borderLight,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconText: {
    fontSize: 18,
  },
  labelTitle: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '700',
  },
  defaultBadge: {
    backgroundColor: Brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Brand.white,
  },
  setDefaultLink: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  setDefaultLinkText: {
    fontSize: 10,
    fontWeight: '600',
    color: Brand.primary,
  },
  addressText: {
    ...Typography.small,
    color: Brand.textSecondary,
    lineHeight: 18,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.white,
    borderWidth: 1.5,
    borderColor: Brand.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    gap: 8,
  },
  addBtnIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: Brand.primary,
  },
  addBtnText: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Brand.primary,
  },
});
