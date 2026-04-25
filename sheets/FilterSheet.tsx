import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Backdrop } from './Backdrop';
import { ALL_CATEGORIES } from '@/data/categories';
import { PS_TOKENS } from '@/theme/tokens';
import { TEXT } from '@/theme/typography';
import { shadow } from '@/theme/shadow';
import type { CardType } from '@/types';

interface FilterSheetProps {
  active: CardType[];
  onChange: (f: CardType[]) => void;
}

const FilterSheet = forwardRef<BottomSheetModal, FilterSheetProps>(
  ({ active, onChange }, ref) => {
    const snapPoints = useMemo(() => ['55%'], []);
    const [local, setLocal] = useState<CardType[]>(active);

    // Sync local state when active prop changes or sheet opens
    useEffect(() => {
      setLocal(active);
    }, [active]);

    const toggle = useCallback((id: CardType) => {
      setLocal((prev) => {
        if (prev.includes(id)) return prev.filter((f) => f !== id);
        return [...prev, id];
      });
    }, []);

    const handleClear = useCallback(() => {
      setLocal([]);
    }, []);

    const handleApply = useCallback(() => {
      onChange(local);
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.dismiss();
      }
    }, [local, onChange, ref]);

    const subtitle =
      local.length === 0
        ? 'Everything'
        : `${local.length} categor${local.length === 1 ? 'y' : 'ies'} selected`;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={Backdrop}
        handleIndicatorStyle={{ backgroundColor: PS_TOKENS.ink3 }}
        backgroundStyle={{ backgroundColor: PS_TOKENS.card }}
      >
        <BottomSheetView style={styles.container}>
          {/* Title */}
          <Text style={[TEXT.sheetTitle, styles.title]}>Show me</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* Chips */}
          <View style={styles.chipWrap}>
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = local.includes(cat.id as CardType);
              return (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.chip,
                    isSelected ? styles.chipSelected : styles.chipUnselected,
                  ]}
                  onPress={() => toggle(cat.id as CardType)}
                >
                  <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      isSelected ? styles.chipLabelSelected : styles.chipLabelUnselected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Pressable style={styles.clearButton} onPress={handleClear}>
              <Text style={[TEXT.buttonLabel, styles.clearLabel]}>Clear</Text>
            </Pressable>
            <Pressable style={styles.applyButton} onPress={handleApply}>
              <Text style={[TEXT.buttonLabel, styles.applyLabel]}>Apply</Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

FilterSheet.displayName = 'FilterSheet';
export { FilterSheet };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  title: {
    color: PS_TOKENS.ink,
    marginBottom: 4,
  },
  subtitle: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink2,
    marginBottom: 20,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipSelected: {
    backgroundColor: PS_TOKENS.ink,
  },
  chipUnselected: {
    backgroundColor: '#FFFFFF',
    ...shadow.button,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    ...TEXT.chip,
    textTransform: 'uppercase',
  },
  chipLabelSelected: {
    color: '#FFFFFF',
  },
  chipLabelUnselected: {
    color: PS_TOKENS.ink,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto' as any,
    paddingBottom: 20,
  },
  clearButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: PS_TOKENS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearLabel: {
    color: PS_TOKENS.ink,
  },
  applyButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: PS_TOKENS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyLabel: {
    color: '#FFFFFF',
  },
});
