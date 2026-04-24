import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';

interface ChipProps {
  type: string;
  emoji: string;
  label: string;
  compact?: boolean;
}

export default function Chip({ type, emoji, label, compact }: ChipProps) {
  const bg = PS_TOKENS.chip[type] ?? PS_TOKENS.ink;
  const fg = type === 'campus' ? PS_TOKENS.brandAccent : '#FFFFFF';

  return (
    <View style={[styles.pill, { backgroundColor: bg }, compact && styles.compact]}>
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 5,
  },
  compact: {
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  emojiWrap: {
    width: 16,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 12,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.95,
    textTransform: 'uppercase',
  },
});
