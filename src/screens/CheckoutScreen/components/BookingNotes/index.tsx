import { Brand, Radius, Spacing, Typography } from '@/constants/brand';
import { NOTE_CHIPS, type NoteChip } from '@/screens/CheckoutScreen/hooks/useCheckout';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface BookingNotesProps {
  noteText: string;
  activeChips: Set<NoteChip>;
  onNoteChange: (text: string) => void;
  onToggleChip: (chip: NoteChip) => void;
  maxChars: number;
}

export const BookingNotes = memo(function BookingNotes({
  noteText,
  activeChips,
  onNoteChange,
  onToggleChip,
  maxChars,
}: BookingNotesProps) {
  const handleToggle = useCallback(
    (chip: NoteChip) => onToggleChip(chip),
    [onToggleChip]
  );

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Booking Notes</Text>
        <View style={styles.optionalBadge}>
          <Text style={styles.optionalText}>Optional</Text>
        </View>
      </View>

      {/* Quick chips */}
      <View style={styles.chipsWrap}>
        {NOTE_CHIPS.map((chip) => {
          const active = activeChips.has(chip);
          return (
            <Pressable
              key={chip}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
              onPress={() => handleToggle(chip)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {active ? '✓ ' : ''}{chip}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Text input */}
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder="Add any special instructions for the technician..."
          placeholderTextColor={Brand.textMuted}
          value={noteText}
          onChangeText={onNoteChange}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          maxLength={maxChars}
          returnKeyType="done"
          blurOnSubmit
        />
        <Text style={styles.charCount}>
          {noteText.length}/{maxChars}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screen,
    backgroundColor: Brand.white,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Brand.borderLight,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  heading: {
    ...Typography.h4,
    color: Brand.textPrimary,
    letterSpacing: -0.2,
  },
  optionalBadge: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  optionalText: {
    ...Typography.caption,
    color: Brand.textMuted,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Brand.border,
    backgroundColor: Brand.white,
  },
  chipActive: {
    borderColor: Brand.primary,
    backgroundColor: Brand.primarySoft,
  },
  chipPressed: { opacity: 0.7 },
  chipText: {
    ...Typography.smallMedium,
    color: Brand.textSecondary,
  },
  chipTextActive: {
    color: Brand.primary,
    fontWeight: '700',
  },
  inputWrap: {
    borderWidth: 1.5,
    borderColor: Brand.border,
    borderRadius: Radius.lg,
    backgroundColor: Brand.offWhite,
    padding: Spacing.md,
  },
  input: {
    ...Typography.small,
    color: Brand.textPrimary,
    minHeight: 72,
    padding: 0,
  },
  charCount: {
    ...Typography.caption,
    color: Brand.textMuted,
    textAlign: 'right',
    marginTop: 6,
  },
});
