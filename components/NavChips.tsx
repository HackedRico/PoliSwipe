import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';
import { shadow } from '@/theme/shadow';

interface NavChipsProps {
  activeFilters: string[];
  savedCount: number;
  careCount: number;
  onFilter: () => void;
  onSaved: () => void;
  onPost: () => void;
  onRecap: () => void;
}

export default function NavChips({
  activeFilters,
  savedCount,
  careCount,
  onFilter,
  onSaved,
  onPost,
  onRecap,
}: NavChipsProps) {
  const filterCount = activeFilters.length;
  const filterActive = filterCount > 0;
  const savedActive = savedCount > 0;

  return (
    <View style={styles.container}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {/* Filter pill */}
      <Pressable
        style={[styles.pill, filterActive && styles.pillActive, shadow.softRow]}
        onPress={onFilter}
      >
        <Text style={[styles.pillText, filterActive && styles.pillTextActive]}>
          Filter
        </Text>
        {filterActive && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{filterCount}</Text>
          </View>
        )}
      </Pressable>

      {/* Saved pill */}
      <Pressable
        style={[styles.pill, savedActive && styles.pillActive, shadow.softRow]}
        onPress={onSaved}
      >
        <Text style={[styles.pillText, savedActive && styles.pillTextActive]}>
          Saved
        </Text>
        {savedActive && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{savedCount}</Text>
          </View>
        )}
      </Pressable>

      {/* Post pill */}
      <Pressable style={[styles.pill, shadow.softRow]} onPress={onPost}>
        <Text style={styles.pillText}>+ Post</Text>
      </Pressable>

      {/* Recap pill */}
      <Pressable style={[styles.pill, styles.recapPill]} onPress={onRecap}>
        <Text style={styles.recapText}>Recap</Text>
        {careCount > 0 && (
          <View style={styles.recapBadge}>
            <Text style={styles.badgeText}>{careCount}</Text>
          </View>
        )}
      </Pressable>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    zIndex: 1,
  },
  scroll: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: PS_TOKENS.ink,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: PS_TOKENS.ink,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: PS_TOKENS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 6,
    position: 'relative',
    top: -2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  recapPill: {
    backgroundColor: PS_TOKENS.brand,
  },
  recapText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recapBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 6,
  },
});
