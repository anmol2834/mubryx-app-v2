import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type SavedAddress } from '../constants';

const LABEL_ICONS: Record<SavedAddress['label'], string> = {
  Home: '🏠',
  Office: '🏢',
  Other: '📍',
};

interface Props {
  addresses: SavedAddress[];
  onEdit: (id: string) => void;
}

export const AddressesSection = memo(function AddressesSection({ addresses, onEdit }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Saved Locations</Text>
      </View>

      <View style={styles.list}>
        {addresses.map((addr) => (
          <Pressable 
            key={addr.id} 
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
            onPress={() => onEdit(addr.id)}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.labelIcon}>{LABEL_ICONS[addr.label]}</Text>
              <View style={styles.cardTexts}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>{addr.label}</Text>
                  {addr.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.address} numberOfLines={2}>{addr.address}</Text>
              </View>
            </View>
          </Pressable>
        ))}
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
});
