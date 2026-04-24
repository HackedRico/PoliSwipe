import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PS_TOKENS } from '@/theme/tokens';

interface TopBarProps {
  onAsk: () => void;
}

export default function TopBar({ onAsk }: TopBarProps) {
  return (
    <View style={styles.row}>
      {/* Left: menu button */}
      <Pressable style={styles.menuBtn}>
        <Ionicons name="menu" size={22} color={PS_TOKENS.ink} />
      </Pressable>

      {/* Center: diamond + brand name */}
      <View style={styles.center}>
        <View style={styles.diamond} />
        <Text style={styles.brandText}>PoliSwipe</Text>
      </View>

      {/* Right: Ask pill + avatar */}
      <View style={styles.rightGroup}>
        <Pressable style={styles.askPill} onPress={onAsk}>
          <Text style={styles.askStar}>{'* '}</Text>
          <Text style={styles.askText}>Ask</Text>
        </Pressable>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>J</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: PS_TOKENS.bg,
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  diamond: {
    width: 8,
    height: 8,
    backgroundColor: PS_TOKENS.brand,
    transform: [{ rotate: '45deg' }],
  },
  brandText: {
    fontWeight: '900',
    fontSize: 17,
    color: PS_TOKENS.ink,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  askPill: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PS_TOKENS.ink,
    paddingHorizontal: 12,
    borderRadius: 17,
  },
  askStar: {
    fontSize: 12,
    color: PS_TOKENS.brandAccent,
  },
  askText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PS_TOKENS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
