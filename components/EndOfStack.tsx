import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';

interface EndOfStackProps {
  onWrap: () => void;
}

export default function EndOfStack({ onWrap }: EndOfStackProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{'\u{1F389}'}</Text>
      <Text style={styles.headline}>{"You're all caught up."}</Text>
      <Text style={styles.subtext}>
        You swiped through every card in your feed. Nice work!
      </Text>
      <Pressable style={styles.button} onPress={onWrap}>
        <Text style={styles.buttonText}>See your Civic Wrap</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: PS_TOKENS.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 15,
    color: PS_TOKENS.ink2,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  button: {
    backgroundColor: PS_TOKENS.brand,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
