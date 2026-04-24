import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';

interface StatPillProps {
  icon: string;
  text: string;
  tone: string;
}

export default function StatPill({ icon, text, tone }: StatPillProps) {
  const toneColor = PS_TOKENS.chip[tone] ?? PS_TOKENS.ink;
  const bg = toneColor + '22';

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.icon, { color: toneColor }]}>{icon}</Text>
      <Text style={[styles.text, { color: toneColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 5,
  },
  icon: {
    fontSize: 13,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
});
