import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { type SavedAddress } from '../constants';

const LABEL_ICONS: Record<SavedAddress['label'], string> = {
  Home: '🏠',
  Office: '🏢',
  Other: '📍',
};

interface Props {
  addresses: SavedAddress[];
  onEdit: (id: string) => void;
  isSaving?: boolean;
}

export const AddressesSection = memo(function AddressesSection({ addresses, onEdit, isSaving }: Props) {
  const homeAddr = addresses.find((a) => a.label.toLowerCase() === 'home');
  const officeAddr = addresses.find((a) => a.label.toLowerCase() === 'office');
  const otherAddr = addresses.find((a) => a.label.toLowerCase() === 'other');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Saved Locations</Text>
      </View>

      <View style={styles.list}>
        {/* SLOT 1: HOME CARD */}
        {homeAddr ? (
          <Pressable
            key={homeAddr.id}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
            onPress={() => !isSaving && onEdit(homeAddr.id)}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.labelIcon}>🏠</Text>
              <View style={styles.cardTexts}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Home</Text>
                  {homeAddr.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.address} numberOfLines={2}>
                  {homeAddr.completeAddress || homeAddr.address}
                </Text>
              </View>
            </View>
            {isSaving && (
              <View style={styles.cardLoadingOverlay}>
                <ActivityIndicator size="small" color={Brand.primary} />
                <Text style={styles.loadingText}>Updating address...</Text>
              </View>
            )}
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.placeholderCard, pressed && { opacity: 0.7 }]}
            onPress={() => !isSaving && onEdit('new_Home')}
          >
            <Text style={styles.labelIcon}>🏠</Text>
            <View style={styles.cardTexts}>
              <Text style={styles.placeholderTitle}>Home Address</Text>
              <Text style={styles.placeholderSub}>Tap to add your Home service address</Text>
            </View>
            {isSaving ? (
              <ActivityIndicator size="small" color={Brand.primary} />
            ) : (
              <Text style={styles.addPlusText}>+</Text>
            )}
          </Pressable>
        )}

        {/* SLOT 2: OFFICE CARD */}
        {officeAddr ? (
          <Pressable
            key={officeAddr.id}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
            onPress={() => !isSaving && onEdit(officeAddr.id)}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.labelIcon}>🏢</Text>
              <View style={styles.cardTexts}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Office</Text>
                  {officeAddr.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.address} numberOfLines={2}>
                  {officeAddr.completeAddress || officeAddr.address}
                </Text>
              </View>
            </View>
            {isSaving && (
              <View style={styles.cardLoadingOverlay}>
                <ActivityIndicator size="small" color={Brand.primary} />
                <Text style={styles.loadingText}>Updating address...</Text>
              </View>
            )}
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.placeholderCard, pressed && { opacity: 0.7 }]}
            onPress={() => !isSaving && onEdit('new_Office')}
          >
            <Text style={styles.labelIcon}>🏢</Text>
            <View style={styles.cardTexts}>
              <Text style={styles.placeholderTitle}>Office Address</Text>
              <Text style={styles.placeholderSub}>Tap to add your Office service address</Text>
            </View>
            {isSaving ? (
              <ActivityIndicator size="small" color={Brand.primary} />
            ) : (
              <Text style={styles.addPlusText}>+</Text>
            )}
          </Pressable>
        )}

        {/* SLOT 3: OTHER CARD */}
        {otherAddr ? (
          <Pressable
            key={otherAddr.id}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
            onPress={() => !isSaving && onEdit(otherAddr.id)}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.labelIcon}>📍</Text>
              <View style={styles.cardTexts}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Other</Text>
                  {otherAddr.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.address} numberOfLines={2}>
                  {otherAddr.completeAddress || otherAddr.address}
                </Text>
              </View>
            </View>
            {isSaving && (
              <View style={styles.cardLoadingOverlay}>
                <ActivityIndicator size="small" color={Brand.primary} />
                <Text style={styles.loadingText}>Updating address...</Text>
              </View>
            )}
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.addOtherCard, pressed && { opacity: 0.7 }]}
            onPress={() => !isSaving && onEdit('new_Other')}
          >
            {isSaving ? (
              <View style={styles.inlineLoadingRow}>
                <ActivityIndicator size="small" color={Brand.primary} />
                <Text style={styles.addOtherText}>Saving Location...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.labelIcon}>📍</Text>
                <Text style={styles.addOtherText}>+ Add Other Location</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.white,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Brand.textPrimary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnText: {
    ...Typography.smallMedium,
    color: Brand.primary,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: Spacing.screen,
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  labelIcon: { fontSize: 22, marginTop: 2 },
  cardTexts: { flex: 1, gap: 4 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: Brand.primarySoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '700',
    color: Brand.primary,
    letterSpacing: 0.3,
  },
  address: {
    ...Typography.small,
    color: Brand.textSecondary,
    lineHeight: 18,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    marginHorizontal: Spacing.screen,
    backgroundColor: Brand.offWhite,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Brand.borderLight,
    borderStyle: 'dashed',
    gap: 6,
  },
  emptyIcon: { fontSize: 32 },
  emptyTitle: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '600',
  },
  emptySubtitle: {
    ...Typography.small,
    color: Brand.textMuted,
    textAlign: 'center',
  },
  placeholderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: Brand.borderLight,
    borderStyle: 'dashed',
    gap: Spacing.md,
  },
  placeholderTitle: {
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '600',
  },
  placeholderSub: {
    ...Typography.caption,
    color: Brand.textMuted,
  },
  addPlusText: {
    fontSize: 20,
    fontWeight: '700',
    color: Brand.primary,
  },
  addOtherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Brand.primary,
    gap: Spacing.sm,
  },
  addOtherText: {
    ...Typography.bodyMedium,
    color: Brand.primary,
    fontWeight: '700',
  },
  cardLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    zIndex: 10,
  },
  loadingText: {
    ...Typography.smallMedium,
    color: Brand.primary,
    fontWeight: '600',
  },
  inlineLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
